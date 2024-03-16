import { Token } from "@uniswap/sdk-core";
import TokenConfigModel from "../models/token-config";
import { chainId } from "../configs/web3";
import { TokenConfig } from "../types/token-config";

export async function getAllConfiguredTokens() {
    const configs = await TokenConfigModel.find({
        $or: [
            { dead: false },
            { dead: undefined }
        ]
    });
    return configs.map((t) => new Token(chainId, t.address, t.decimals, t.symbol, t.name));
}

export async function addConfiguredTokens(token: TokenConfig) {
    const newToken = new TokenConfigModel(token);
    newToken.save();
}
