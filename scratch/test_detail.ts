import { databaseService } from '../src/services/databaseService.ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
    const res = await databaseService.fetchMatchDetail('m1');
    console.log("Result AI Prediction:", res.data?.metadata?.ai_prediction);
}
run();
