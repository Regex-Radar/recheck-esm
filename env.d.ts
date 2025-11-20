declare module 'process' {
    declare global {
        namespace NodeJS {
            type RECHECK_BACKEND = 'native' | 'java' | 'thread-worker' | 'web-worker' | 'worker';
            type RECHECK_BACKEND_SYNC = 'synckit' | 'pure' | 'scalajs';
            type RECHECK_PLATFORM = 'node' | 'browser';

            interface ProcessEnv {
                RECHECK_BACKEND: RECHECK_BACKEND;
                RECHECK_SYNC_BACKEND: RECHECK_BACKEND_SYNC;
                RECHECK_PLATFORM: RECHECK_PLATFORM;
            }
        }
    }
}
