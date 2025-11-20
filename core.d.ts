import type { BackendSync } from './src/core/builder.ts';
import type { Diagnostics, HasAbortSignal, Parameters } from './types.js';

export type CheckFn = (
    source: string,
    flags: string,
    params?: Parameters & HasAbortSignal,
) => Promise<Diagnostics>;
export type CheckSyncFn = (source: string, flags: string, params?: Parameters) => Diagnostics;

export type Backend = AgentBackend | WorkerPoolBackend;

export interface AgentBackend {
    createAgent(): Promise<Agent>;
}

export interface WorkerPoolBackend {
    createWorkerPool(workerPath?: string, workerPoolSize?: number): WorkerPool;
}

export interface BackendSync {
    createCheckSync(): CheckSyncFn;
}

// builder functions

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
export function createCheckSync(backend: BackendSync): CheckSyncFn;

// async backends
declare const native: AgentBackend;
declare const java: AgentBackend;
declare const worker: WorkerPoolBackend;
declare const threadWorker: WorkerPoolBackend;
declare const webWorker: WorkerPoolBackend;

// sync backends
declare const scalajs: BackendSync;
declare const synckit: BackendSync;

export { createCheck, createCheckSync, native, worker, threadWorker, webWorker, scalajs, synckit };
