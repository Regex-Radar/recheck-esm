import type { WorkerInterface } from '../worker/worker-interface.js';

// `workerPath` will be a (default) path to the worker source file
// it is important that the `createWorker` functions allow for the caller to override these values,
// as the path's might vary based on the compiletime and runtime environments
// TODO: figure out the best value for this path
const defaultwebWorkerPath = import.meta.resolve('@regex-radar/recheck-esm/web.worker.js');

export function createWebWorker(webWorkerPath: string | URL = defaultwebWorkerPath): WorkerInterface {
    if (typeof webWorkerPath === 'string' && webWorkerPath.startsWith('file://')) {
        webWorkerPath = new URL(webWorkerPath);
    }
    const worker = new Worker(webWorkerPath);
    return worker;
}
