import mongoose, { Schema } from "mongoose";
import { TokenConfig } from "../types/token-config";

const TokenConfigSchema = new Schema<TokenConfig>({
    address: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    decimals: {
        type: Number,
        required: true
    },
    dead: {
        type: Boolean,
        required: false,
        default: false
    }
})

const TokenConfigModel = mongoose.model('TokenConfig', TokenConfigSchema);
export default TokenConfigModel;