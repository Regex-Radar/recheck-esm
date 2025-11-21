import { check } from '@regex-radar/recheck-scalajs-wasm';
import { bootstrapWebWorker } from './shared.worker.js';

bootstrapWebWorker(check);
