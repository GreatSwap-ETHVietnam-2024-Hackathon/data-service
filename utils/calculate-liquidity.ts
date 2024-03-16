import BigNumber from "bignumber.js";
import { WETH_ADDRESS } from "../configs/contracts";

export function calculateRangedETHReserveInV2Pool(
    tokenReserve: BigNumber,
    ethReserve: BigNumber,
    standardSlippage: number = 0.1
) {
    const k = ethReserve.multipliedBy(tokenReserve);
    const currentPrice = ethReserve.dividedBy(tokenReserve);
    const highPrice = currentPrice.multipliedBy(1 + standardSlippage);

    const highETH = highPrice.multipliedBy(k).sqrt().minus(ethReserve);

    const lowPrice = currentPrice.multipliedBy(1 - standardSlippage);

    const lowETH = ethReserve.minus(lowPrice.multipliedBy(k).sqrt());

    return highETH.plus(lowETH).dividedBy(2);
}

export function calculateETHReserveInV3Pool(
    token: string,
    liquidity: BigNumber,
    sqrtPrice: BigNumber,
    standardSlippage: number = 0.1
) {

    const isETHToken0 = token.toLowerCase() > WETH_ADDRESS.toLowerCase();
    const sqrtPriceHigh = sqrtPrice.multipliedBy(Math.sqrt(1 + standardSlippage));
    const sqrtPriceLow = sqrtPrice.multipliedBy(Math.sqrt(1 - standardSlippage));

    const amount0 = liquidity
        .multipliedBy(sqrtPriceHigh.minus(sqrtPriceLow))
        .dividedBy(sqrtPriceLow).dividedBy(sqrtPriceHigh)

    const amount1 = liquidity
        .multipliedBy(sqrtPriceHigh.minus(sqrtPriceLow))

    return isETHToken0 ? amount0 : amount1;
}