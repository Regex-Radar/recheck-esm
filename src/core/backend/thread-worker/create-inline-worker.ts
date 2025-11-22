import { Worker as WorkerThread } from 'node:worker_threads';
import { createWorkerInterface } from './create-worker.js';
import type { WorkerInterface } from '../worker/worker-interface.js';

// these imports will be handled by an esbuild plugin
// `workerSourceCode` will be the source code of the workers, to allow for calling `createInlineWorker()`
// it is important that these value is only used in the `createInlineWorker` function body to make sure the ScalaJS code base is removed
// by tree-shaking / dead code elimination
import threadWorkerSourceCode from './thread.worker.ts?esbuild';

export function createInlineThreadWorker(): WorkerInterface {
    const thread = new WorkerThread(threadWorkerSourceCode, { eval: true });
    return createWorkerInterface(thread);
}
