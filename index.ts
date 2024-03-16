import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { runTasks } from "./fetch-data-onchain/run-tasks";
async function main() {
    await mongoose.connect(process.env.MONGO_URL!, {
        dbName: process.env.MONGO_DB_NAME!,
        user: process.env.MONGO_USERNAME!,
        pass: process.env.MONGO_PASSWORD!,
        autoCreate: true,
        autoIndex: true,
    });
    console.log("Mongo DB is up");
    runTasks();
}

main();
