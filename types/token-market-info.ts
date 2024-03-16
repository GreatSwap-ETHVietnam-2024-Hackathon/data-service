import { BigNumberish } from "ethers";

export type Pool = {
    name: 'Pancake' | 'Lynex';
    address: string;
    liquidity: string;
    fee?: BigNumberish;
    feeZto?: BigNumberish;
    feeOtz?: BigNumberish;
    sqrtPriceX96: string;
}

export interface UniV3Pool {
    name: 'Pancake';
    address: string;
    fee: number;
    liquidity: string;
    sqrtPriceX96: string;
}

export interface CamelotV3Pool {
    name: 'Lynex';
    address: string;
    fee: BigNumberish;
    liquidity: string;
    sqrtPriceX96: string;
}

export default interface TokenMarketInfo {
    address: string;
    mostLiquidPool: Pool;
    marketCap: string;
    priceETH: string;
    priceUSDC: string;
}
