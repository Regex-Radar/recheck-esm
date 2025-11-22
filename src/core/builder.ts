import type {
    AgentBackend,
    Backend,
    BackendSync,
    CheckFn,
    CheckSyncFn,
    WorkerPoolBackend,
} from '../../core.js';
import type { Agent } from './backend/agent.js';
import type { WorkerPool } from './backend/worker-pool.js';

const dispose: typeof Symbol.dispose = Symbol.dispose ?? Symbol.for('dispose');

export async function createCheck(backend: AgentBackend): Promise<CheckFn>;
export async function createCheck(
    backend: WorkerPoolBackend,
    options?: {
        workerPath?: string;
        workerPoolSize?: number;
    },
): Promise<CheckFn>;
export async function createCheck(
    backend: Backend,
    options?: {
        workerPath?: string;
        workerPoolSize?: number;
    },
): Promise<CheckFn>;
export async function /* @__PURE__ */ createCheck(
    backend: Backend,
    options: {
        workerPath?: string;
        workerPoolSize?: number;
    } = {},
): Promise<CheckFn> {
    if ('createAgent' in backend) {
        const agent = (await backend.createAgent()) as Agent;
        const fn: CheckFn & Disposable = (...args) => agent.check(...args);
        fn[dispose] = () => agent.kill();
        return fn;
    } else {
        const pool = backend.createWorkerPool(options.workerPath, options.workerPoolSize) as WorkerPool;
        const fn: CheckFn & Disposable = (...args) => pool.check(...args);
        fn[dispose] = () => pool.kill();
        return fn;
    }
}

export function createCheckSync(backend: BackendSync): CheckSyncFn {
    return backend.createCheckSync();
}
