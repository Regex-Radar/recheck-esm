import { runAsWorker } from 'synckit';
import { check } from '@regex-radar/recheck-scalajs';

runAsWorker(async (...args: Parameters<typeof check>) => {
    return check(...args);
});
