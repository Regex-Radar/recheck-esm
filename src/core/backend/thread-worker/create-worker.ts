import { Worker as WorkerThread } from 'node:worker_threads';
import type { WorkerInterface } from '../worker/worker-interface.js';

// `workerPath` will be a (default) path to the worker source file
// it is important that the `createWorker` functions allow for the caller to override these values,
// as the path's might vary based on the compiletime and runtime environments
// TODO: figure out the best value for this path
const defaultThreadWorkerPath = import.meta.resolve('@regex-radar/recheck-esm/thread.worker.js');

export function createWorkerInterface(thread: WorkerThread): WorkerInterface {
    return {
        addEventListener(name: 'message', callback: (data: unknown) => void): void {
            thread.on('message', (data: unknown) => callback({ data }));
        },
        postMessage(message: string): void {
            thread.postMessage(message);
        },
        terminate() {
            return thread.terminate();
        },
        ref() {
            thread.ref();
        },
        unref() {
            thread.unref();
        },
    };
}

export function createThreadWorker(
    threadWorkerPath: string | URL = defaultThreadWorkerPath,
): WorkerInterface {
    if (typeof threadWorkerPath === 'string' && threadWorkerPath.startsWith('file://')) {
        threadWorkerPath = new URL(threadWorkerPath);
    }
    const thread = new WorkerThread(threadWorkerPath);
    return createWorkerInterface(thread);
}
