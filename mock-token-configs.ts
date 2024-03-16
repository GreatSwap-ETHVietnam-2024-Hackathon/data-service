import dotenv from "dotenv";
dotenv.config();

import { TokenConfig } from "./types/token-config";
import TokenConfigModel from "./models/token-config";
import mongoose from "mongoose";


async function main() {
    await mongoose.connect(process.env.MONGO_URL!, {
        dbName: process.env.MONGO_DB_NAME!,
        user: process.env.MONGO_USERNAME!,
        pass: process.env.MONGO_PASSWORD!,
        autoCreate: true,
        autoIndex: true,
    });
    console.log("Mongo DB is up");

    console.log(await TokenConfigModel.find())
    const tokenConfigs: TokenConfig[] = [
        {
            address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
            name: 'Arbitrum',
            symbol: 'ARB',
            decimals: 18
        },
        {
            address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
            name: 'Wrapped BTC',
            symbol: 'WBTC',
            decimals: 8
        }, {
            address: '0x00cbcf7b3d37844e44b888bc747bdd75fcf4e555',
            name: 'xPet.tech Token',
            symbol: 'XPET',
            decimals: 18
        }, {
            address: '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a',
            name: 'GMX',
            symbol: 'GMX',
            decimals: 18
        }, {
            address: '0x9842989969687f7d249d01cae1d2ff6b7b6b6d35',
            name: 'New Crypto Space',
            symbol: 'CRYPTO',
            decimals: 18
        }, {
            address: '0xf97f4df75117a78c1a5a0dbb814af92458539fb4',
            name: 'ChainLink token',
            symbol: 'LINK',
            decimals: 18
        }, {
            address: '0x4e352cf164e64adcbad318c3a1e222e9eba4ce42',
            name: 'MUX Protocol',
            symbol: 'MCB',
            decimals: 18
        }, {
            address: '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8',
            name: 'Pendle',
            symbol: 'PENDLE',
            decimals: 18
        }, {
            address: '0x539bde0d7dbd336b79148aa742883198bbf60342',
            name: 'MAGIC',
            symbol: 'MAGIC',
            decimals: 18
        }, {
            address: '0x6daf586b7370b14163171544fca24abcc0862ac5',
            name: 'BPET',
            symbol: 'BPET',
            decimals: 18
        }
    ].map(t => ({ ...t, address: t.address.toLowerCase() }))

    for (let i = 0; i < tokenConfigs.length; i++) {
        await TokenConfigModel.updateOne({
            address: tokenConfigs[i].address.toLowerCase()
        }, {
            $set: tokenConfigs[i]
        }, {
            upsert: true
        })
    }

    console.log("Done")
}

main();