import { runAsWorker } from 'synckit';
import { check } from '@regex-radar/recheck-scalajs';

runAsWorker(async (...args) => {
    return check(...args);
});
