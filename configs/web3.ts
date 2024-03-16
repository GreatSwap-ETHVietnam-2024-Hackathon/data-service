import { ethers } from "ethers";
import { AlgebraV19Pool__factory, ERC20__factory, UniswapV3Pool__factory } from "../typechain-types";

export const chainId = 31337;
export const erc20Interface = ERC20__factory.createInterface();
export const uniswapV3PoolInterface = UniswapV3Pool__factory.createInterface();
export const algebraV19PoolInterface = AlgebraV19Pool__factory.createInterface();

const RPCs = [
    // "http://0.0.0.0:9000/",
    process.env.RPC_URL || ''
]

export async function getBestRPC() {
    async function ping(rpc: string) {
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        await provider.getNetwork();
        return provider;
    }

    return await Promise.race(RPCs.map(rpc => ping(rpc)))
}