import { chainId } from "./web3";
import { Token } from "@uniswap/sdk-core";

export const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11"
export const ETH_USDC_POOL_ADDRESS = "0x176211869ca2b568f2a7d4ee941e073a821ee1ff"
export const USDC_ADDRESS = "0x176211869ca2b568f2a7d4ee941e073a821ee1ff"
export const WETH_ADDRESS = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f"

export const WETH = new Token(
    chainId,
    WETH_ADDRESS,
    18
)
export const USDC = new Token(
    chainId,
    USDC_ADDRESS,
    6,
    "USDC",
    "USDC"
)