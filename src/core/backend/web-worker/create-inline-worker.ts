import type { WorkerInterface } from '../worker/worker-interface.js';

// these imports will be handled by an esbuild plugin
// `workerSourceCode` will be the source code of the workers, to allow for calling `createInlineWorker()`
// it is important that these value is only used in the `createInlineWorker` function body to make sure the ScalaJS code base is removed
// by tree-shaking / dead code elimination
import webWorkerSourceCode from './web.worker.ts?esbuild';

export function createInlineWebWorker(): WorkerInterface {
    const blob = new Blob([webWorkerSourceCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    return worker;
}
