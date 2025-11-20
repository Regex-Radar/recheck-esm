import { createWorkerPool as createWebWorkerPool } from '../web-worker/index.js';
import { createWorkerPool as createThreadWorkerPool } from '../thread-worker/index.js';
import type { WorkerPoolBackend } from '../../builder.js';
import type { WorkerPool } from '../worker-pool.js';

export const createWorkerPool: WorkerPoolBackend['createWorkerPool'] = (workerPath?: string): WorkerPool => {
    switch (process.env['RECHECK_PLATFORM'] ?? detectPlatform()) {
        case 'node': {
            return createThreadWorkerPool(workerPath);
        }
        case 'browser': {
            return createWebWorkerPool(workerPath);
        }
        default: {
            throw new Error(`invalid platform: ${process.env['RECHECK_PLATFORM']}`);
        }
    }
};

function detectPlatform(): typeof process.env.RECHECK_PLATFORM {
    if (typeof process === 'object' && process.versions?.node) {
        return 'node';
    } else {
        return 'browser';
    }
}
