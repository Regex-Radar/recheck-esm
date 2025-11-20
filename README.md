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

// With he synckit worker backend
const checkSync = createCheckSync(synckit);
```

## Worker file paths

TODO: something about the worker files, their paths and passing custom paths.

## Worker Pool

TODO: something about the worker pool, and its configurable amount of max workers.

## `recheck`

For more information about `recheck` see:

- [the official documentation](https://makenowjust-labs.github.io/recheck/docs/usage/as-javascript-library)
- [the GitHub repository](https://github.com/makenowjust-labs/recheck)
