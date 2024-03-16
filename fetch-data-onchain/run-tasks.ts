import { USDC } from "../configs/contracts";
import { getBestRPC } from "../configs/web3";
import { getAllConfiguredTokens } from "../services/token-config";
import { chunk } from "../utils/array";
import { fetchMarketData } from "./pool";

const MAX_TOKENS_PER_CALL = 50;

export async function runTasks() {
    setInterval(async () => {
        try {
            const provider = await getBestRPC();
            const configuredTokens = await getAllConfiguredTokens();
            const chunks = chunk(configuredTokens, MAX_TOKENS_PER_CALL);
            await Promise.all(chunks.map(tokenChunk => fetchMarketData(provider, [USDC, ...tokenChunk])));
        } catch (err) {
            console.log(err);
        }
    }, 5000);
}
