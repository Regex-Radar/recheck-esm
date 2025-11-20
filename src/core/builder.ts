import type {
    AgentBackend,
    Backend,
    BackendSync,
    CheckFn,
    CheckSyncFn,
    WorkerPoolBackend,
} from '../../core.js';
import { check } from './backend/agent.js';

export async function createCheck(backend: AgentBackend): Promise<CheckFn>;
export async function createCheck(
    backend: WorkerPoolBackend,
    workerPath?: string,
    workerPoolSize?: number,
): Promise<CheckFn>;
export async function createCheck(
    backend: Backend,
    workerPath?: string,
    workerPoolSize?: number,
): Promise<CheckFn>;
export async function createCheck(
    backend: Backend,
    workerPath?: string,
    workerPoolSize?: number,
): Promise<CheckFn> {
    if ('createAgent' in backend) {
        const agent = await backend.createAgent();
        return (...args) => check(agent, ...args);
    } else {
        const pool = backend.createWorkerPool(workerPath, workerPoolSize);
        return (...args) => pool.check(...args);
    }
}

export function createCheckSync(backend: BackendSync): CheckSyncFn {
    return backend.createCheckSync();
}
