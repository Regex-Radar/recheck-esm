import { check } from '@regex-radar/recheck-scalajs-wasm';
import { bootstrapThreadWorker } from './shared.worker.js';

bootstrapThreadWorker(check);
