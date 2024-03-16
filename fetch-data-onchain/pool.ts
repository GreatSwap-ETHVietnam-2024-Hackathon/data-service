import { Token } from "@uniswap/sdk-core";
import { calculateCamelotV3PoolAddress, calculateUniV3PoolAddress } from "../utils/calculate-pool-address";
import { AlgebraV19Pool__factory, ERC20__factory, Multicall__factory, UniswapV3Pool__factory } from "../typechain-types";
import BigNumber from "bignumber.js";
import { CamelotV3Pool, Pool, UniV3Pool } from "../types/token-market-info";
import { calculatePriceFromPool } from "../utils/calculate-price";
import TokenMarketModel from "../models/token-market-info";
import { ethers } from "ethers";
import { MULTICALL_ADDRESS, WETH_ADDRESS } from "../configs/contracts";
import TokenConfigModel from "../models/token-config";

const UniswapV3PoolInterface = UniswapV3Pool__factory.createInterface();
const CamelotV3PoolInterface = AlgebraV19Pool__factory.createInterface();
const ERC20Interface = ERC20__factory.createInterface();

export async function fetchMarketData(provider: ethers.providers.JsonRpcProvider, tokens: Token[]) {
    const UniV3Fees = [100, 500, 2500, 10000];
    const numberOfCallsPerToken = UniV3Fees.length * 2 + 2 + 1;
    const numberOfPoolsPerToken = UniV3Fees.length + 1;

    const poolAddresses: string[] = [];
    let calls: {
        target: string;
        allowFailure: boolean;
        callData: string;
    }[] = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Uniswap v3 pools
        for (let j = 0; j < UniV3Fees.length; j++) {
            const UniV3poolAddress = calculateUniV3PoolAddress(token, UniV3Fees[j]);
            poolAddresses.push(UniV3poolAddress);

            const UniV3LiquidityCall = {
                target: WETH_ADDRESS,
                allowFailure: true,
                callData: ERC20Interface.encodeFunctionData("balanceOf", [UniV3poolAddress])
            }

            const UniV3Slot0Call = {
                target: UniV3poolAddress,
                allowFailure: true,
                callData: UniswapV3PoolInterface.encodeFunctionData("slot0")
            }

            calls = [...calls, UniV3LiquidityCall, UniV3Slot0Call]
        }

        // Camelot V3 pools
        const CamelotV3PoolAddress = calculateCamelotV3PoolAddress(token);
        poolAddresses.push(CamelotV3PoolAddress)

        const CamelotV3LiquidityCall = {
            target: WETH_ADDRESS,
            allowFailure: true,
            callData: ERC20Interface.encodeFunctionData("balanceOf", [CamelotV3PoolAddress])
        }

        const CamelotV3SlotCall = {
            target: CamelotV3PoolAddress,
            allowFailure: true,
            callData: CamelotV3PoolInterface.encodeFunctionData("globalState")
        }

        calls = [...calls, CamelotV3LiquidityCall, CamelotV3SlotCall]

        const totalSupplyCall = {
            target: token.address,
            allowFailure: true,
            callData: ERC20Interface.encodeFunctionData("totalSupply"),
        }

        calls = [...calls, totalSupplyCall];
    }

    const multicall = Multicall__factory.connect(MULTICALL_ADDRESS, provider);
    const results = await multicall.callStatic.aggregate3(calls);

    let ETHPriceInUSDC: BigNumber = new BigNumber(0);


    for (let i = 0; i < tokens.length; i++) {
        let maxETHLiquidity = new BigNumber(10);
        let mostLiquidPool: Pool = {
            name: 'Pancake',
            address: '',
            liquidity: '',
            sqrtPriceX96: ''
        };

        const token = tokens[i];
        const resultsForToken = results.slice(i * numberOfCallsPerToken, (i + 1) * numberOfCallsPerToken);
        const poolsForToken = poolAddresses.slice(i * numberOfPoolsPerToken, (i + 1) * numberOfPoolsPerToken);

        for (let j = 0; j < UniV3Fees.length; j++) {
            const UniswapPoolAddress = poolsForToken[j];
            const UniV3LiquidityResult = resultsForToken[2 * j].returnData;
            const UniV3Slot0Result = resultsForToken[2 * j + 1].returnData;

            if (UniV3LiquidityResult.length > 2 && UniV3Slot0Result.length > 2) {
                const ethLiquidity = new BigNumber(ERC20Interface.decodeFunctionResult('balanceOf', UniV3LiquidityResult)[0].toHexString())
                const sqrtPriceX96 = new BigNumber(UniswapV3PoolInterface.decodeFunctionResult("slot0", UniV3Slot0Result)[0].toHexString())
                if (ethLiquidity.gt(maxETHLiquidity)) {
                    maxETHLiquidity = ethLiquidity;

                    const pool: UniV3Pool = {
                        name: 'Pancake',
                        address: UniswapPoolAddress,
                        liquidity: ethLiquidity.toFixed(0),
                        fee: UniV3Fees[j],
                        sqrtPriceX96: sqrtPriceX96.toFixed(0)
                    }

                    mostLiquidPool = pool
                }
            }
        }

        const CamelotV3LiquidityResult = resultsForToken[UniV3Fees.length * 2].returnData;
        const CamelotV3Slot0Result = resultsForToken[UniV3Fees.length * 2 + 1].returnData;
        const CamelotV3PoolAddress = poolsForToken[UniV3Fees.length];
        if (CamelotV3LiquidityResult.length > 2 && CamelotV3Slot0Result.length > 2) {
            const ethLiquidity = new BigNumber(ERC20Interface.decodeFunctionResult('balanceOf', CamelotV3LiquidityResult)[0].toHexString())
            const sqrtPriceX96 = new BigNumber(CamelotV3PoolInterface.decodeFunctionResult("globalState", CamelotV3Slot0Result)[0].toHexString())
            const fee = CamelotV3PoolInterface.decodeFunctionResult("globalState", CamelotV3Slot0Result)[2].toString()
            if (ethLiquidity.gt(maxETHLiquidity)) {
                maxETHLiquidity = ethLiquidity;

                const pool: CamelotV3Pool = {
                    name: 'Lynex',
                    address: CamelotV3PoolAddress,
                    liquidity: ethLiquidity.toFixed(0),
                    fee,
                    sqrtPriceX96: sqrtPriceX96.toFixed(0)
                }

                mostLiquidPool = pool
            }
        }

        if (mostLiquidPool.address.length === 0) {
            await TokenMarketModel.deleteOne({
                address: token.address.toLowerCase()
            })
            await TokenConfigModel.updateOne({
                address: token.address.toLowerCase()
            }, {
                dead: true
            })
            continue;
        }

        const totalSupplyResult = resultsForToken[UniV3Fees.length * 2 + 2].returnData;
        const totalSupply = new BigNumber(ERC20Interface.decodeFunctionResult("totalSupply", totalSupplyResult)[0].toHexString());
        const priceETH = calculatePriceFromPool(token, mostLiquidPool)
        if (i === 0) {
            ETHPriceInUSDC = new BigNumber(1).dividedBy(priceETH);
            await TokenMarketModel.updateOne({
                address: token.address.toLowerCase()
            }, {
                priceETH: priceETH.toFixed(20),
                priceUSDC: new BigNumber(1).toFixed(20),
                marketCap: totalSupply.dividedBy(new BigNumber(10).pow(token.decimals)).toFixed(20),
                mostLiquidPool
            }, {
                upsert: true
            });
        } else {
            const priceUSDC = priceETH.multipliedBy(ETHPriceInUSDC);
            const marketCap = totalSupply.dividedBy(new BigNumber(10).pow(token.decimals)).multipliedBy(priceUSDC);
            await TokenMarketModel.updateOne({
                address: token.address.toLowerCase()
            }, {
                priceETH: priceETH.toFixed(20),
                priceUSDC: priceUSDC.toFixed(20),
                marketCap: marketCap.toFixed(20),
                mostLiquidPool
            }, {
                upsert: true
            });
        }
    }


}
