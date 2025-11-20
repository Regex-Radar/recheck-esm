import type { WorkerPoolBackend } from '../../../../core.js';
import { WorkerPool } from '../worker-pool.js';
import { createThreadWorker } from './create-worker.js';

export const createWorkerPool: WorkerPoolBackend['createWorkerPool'] = (
    threadWorkerPath?: string,
    workerPoolSize?: number,
) => {
    const pool = new WorkerPool(() => createThreadWorker(threadWorkerPath), workerPoolSize);
    return pool;
};
