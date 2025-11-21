# `recheck-esm`

> [!NOTE]
>
> This is a custom build of [`recheck`](https://github.com/makenowjust-labs/recheck/tree/main/packages/recheck) to enable consumers to build against an ESM build. See https://github.com/makenowjust-labs/recheck/issues/1619 for more info. When an ESM build is available in `recheck`, this repo/package will be archived.

## API

This build provides the following API:

```ts
// esm-recheck provides the original API
import { check, checkSync } from 'recheck-esm';

// esm-recheck additionally provides:
import {
    // builder functions
    createCheck,
    createCheckSync,
    // async backends
    native,
    java,
    worker,
    threadWorker,
    webWorker,
    // sync backends
    scalajs,
    synckit,
} from 'recheck-esm/core';

// and the following worker files:
import threadWorker from 'recheck-esm/thread.worker.js';
import webWorker from 'recheck-esm/web.worker.js';
import synckit from 'recheck-esm/synckit.worker.js';
```

This enables for a more fine-grained use which bundlers can properly tree-shake, used like:

```ts
// async
import { createCheck, native, java, webWorker, threadWorker } from 'recheck-esm';

// with the native backend
const check = createCheck(native);

// with the java backend
const check = createCheck(java);

// with the NodeJS thread worker backend
const check = createCheck(threadWorker);

// with the Web Worker backend
const check = createCheck(webWorker);
```

Or the sync version:

```ts
// sync
import { createCheckSync, scalajs, synckit } from 'recheck-esm';

// With the scalajs backend
const checkSync = createCheckSync(scalajs);

// With the synckit worker backend
const checkSync = createCheckSync(synckit);
```

## Environment variables

These environment variables are similar as `recheck`, with some slight variations:

- there is no `auto` option, the defaults are stated below
- it allows bundlers to replace `process.env['RECHECK_*']` in the source code with their respective 'define' features, allowing for better results with tree-shaking

### `RECHECK_BACKEND`

```ts
type RECHECK_BACKEND = 'native' | 'java' | 'thread-worker' | 'web-worker' | 'worker';
```

When using the default `check` function, it will use the `RECHECK_BACKEND` environment variable to determine which backend to use. It will default to `worker` if not set.

When using a bundler, it is encouraged to use its define/replacement feature to define `process.env['RECHECK_BACKEND']` to a constant string, as it will allow the bundler to remove the backends that are not used.

### `RECHECK_SYNC_BACKEND`

```ts
type RECHECK_BACKEND_SYNC = 'synckit' | 'pure' | 'scalajs';
```

When using the default `checkSync` function, it will use the `RECHECK_SYNC_BACKEND` environment variable to determine which backend to use. It will default to `worker` if not set.

When using a bundler, it is encouraged to use its define/replacement feature to define `process.env['RECHECK_SYNC_BACKEND']` to a constant string, as it will allow the bundler to remove the backends that are not used.

### `RECHECK_PLATFORM`

```ts
type RECHECK_PLATFORM = 'node' | 'browser';
```

When using the `worker` backend, it will use the `RECHECK_PLATFORM` to determine to use the `web-worker` (browser) or `thread-worker` (node) backend. It will default to try and detect the environment it is running in if not set.

When using a bundler, it is encouraged to use its define/replacement feature to define `process.env['RECHECK_PLATFORM']` to a constant string, as it will allow the bundler to remove the backends that are not used.

## Worker file paths

TODO: something about the worker files, their paths and passing custom paths. Also mention [`recheck-scalajs`](https://github.com/Regex-Radar/recheck-scalajs).

### Wasm workers

TODO: something about the experimental WASM workers at [`recheck-scalajs-wasm`](https://github.com/Regex-Radar/recheck-scalajs-wasm).

## Worker Pool

TODO: something about the worker pool, and its configurable amount of max workers.

## `recheck`

For more information about `recheck` see:

- [the official documentation](https://makenowjust-labs.github.io/recheck/docs/usage/as-javascript-library)
- [the GitHub repository](https://github.com/makenowjust-labs/recheck)
