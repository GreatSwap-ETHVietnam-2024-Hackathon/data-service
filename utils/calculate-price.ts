import { Token } from "@uniswap/sdk-core";
import { Pool } from "../types/token-market-info";
import BigNumber from "bignumber.js";
import { Q96 } from "../configs/constants";
import { WETH_ADDRESS } from "../configs/contracts";

export function calculatePriceFromPool(token: Token, pool: Pool) {
    const isETHToken0 = token.address.toLowerCase() > WETH_ADDRESS.toLowerCase();
    let ratio: BigNumber
    ratio = new BigNumber(pool.sqrtPriceX96!).dividedBy(Q96).pow(2);
    if (isETHToken0) ratio = new BigNumber(1).dividedBy(ratio);

    return ratio.multipliedBy(new BigNumber(10).pow(token.decimals - 18));
}