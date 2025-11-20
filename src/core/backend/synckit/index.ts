import { createSyncFn } from 'synckit';
import type { CheckSyncFn } from '../../../../core.js';
const defaultSynckitWorkerPath = import.meta.resolve('./synckit.worker');

export function createCheckSync(synckitWorkerPath: string | URL = defaultSynckitWorkerPath) {
    if (typeof synckitWorkerPath === 'string' && synckitWorkerPath.startsWith('file://')) {
        synckitWorkerPath = new URL(synckitWorkerPath);
    }
    // TODO: investigate this, might stall
    return createSyncFn<CheckSyncFn>(synckitWorkerPath);
}
