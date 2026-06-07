import * as dotenv from 'dotenv';
dotenv.config();

// Mock import.meta.env
(global as any).import = { meta: { env: process.env } };

import { databaseService } from './src/services/databaseService';

async function run() {
    try {
        console.log('Resolving match...');
        const res = await databaseService.resolveMatch('1498589', 1, 2);
        console.log('Result:', res);
    } catch (e) {
        console.error(e);
    }
}

run();
