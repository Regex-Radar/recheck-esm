import { writeFile, mkdir, glob } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { build as esbuild } from 'esbuild';

import type { BuildOptions, Plugin } from 'esbuild';

const isProduction = process.env['NODE_ENV'] === 'production' || process.argv.includes('--production');
const writeMetafile = process.argv.includes('--metafile');
const analyze = process.argv.includes('--analyze');

const metafilePlugin: Plugin = {
    name: 'metafile',
    setup(build) {
        if (writeMetafile && build.initialOptions.outfile) {
            build.initialOptions.metafile = true;
            build.onEnd(async (result) => {
                if (!result.errors.length && result.metafile && build.initialOptions.outfile) {
                    await mkdir('./dist', { recursive: true });
                    const name = basename(build.initialOptions.outfile);
                    return writeFile(`./dist/${name}.metafile.json`, JSON.stringify(result.metafile));
                }
            });
        }
    },
};

const esbuildLoaderPlugin: Plugin = {
    name: 'esbuild-loader',
    setup(build) {
        const filter = /\?esbuild$/;
        build.onResolve({ filter }, (args) => {
            let path = args.path.replace('?esbuild', '');
            path = resolve(args.resolveDir, path);
            return {
                namespace: 'esbuild-loader',
                path,
                external: false,
                sideEffects: false,
            };
        });
        build.onLoad({ filter: /.*/, namespace: 'esbuild-loader' }, async (args) => {
            const result = await esbuild({
                entryPoints: [args.path],
                minify: isProduction,
                bundle: true,
                treeShaking: true,
                sourcemap: false,
                format: 'esm',
                write: false,
                logLevel: 'error',
                packages: 'external',
            });
            const contents = result.outputFiles[0].contents;
            return {
                contents,
                loader: 'text',
            };
        });
    },
};

type SimpleBuildOptions = Pick<
    BuildOptions,
    'entryPoints' | 'inject' | 'format' | 'platform' | 'outfile' | 'plugins' | 'bundle' | 'outdir' | 'outbase'
>;

async function build(options: SimpleBuildOptions) {
    const buildOptions: BuildOptions = {
        minify: isProduction,
        target: 'es2020',
        define: {},
        bundle: true,
        format: 'esm',
        treeShaking: true,
        minifySyntax: true,
        logLevel: analyze ? 'verbose' : 'error',
        packages: 'external',
        ...options,
        plugins: [metafilePlugin].concat(options.plugins ?? []),
    };
    // by default esbuild will try `main` package imports before `module`, causing to often bundle dependencies as CJS
    // setting `mainFields` will look for a `module` format (ESM) before `main` (usually CJS)
    // see: https://esbuild.github.io/api/#main-fields
    buildOptions.mainFields = ['module', 'main'];
    if (buildOptions.platform === 'browser') {
        // if `platform` is browser, have esbuild check for a `browser` format over `module` and `main`
        buildOptions.mainFields.unshift('browser');
    }
    return await esbuild(buildOptions);
}

const workers: BuildOptions[] = [
    {
        entryPoints: ['src/core/backend/thread-worker/thread.worker.ts'],
        platform: 'node',
        outfile: 'lib/thread.worker.js',
    },
    {
        entryPoints: ['src/core/backend/thread-worker/thread.wasm.worker.ts'],
        platform: 'node',
        outfile: 'lib/thread.wasm.worker.js',
    },
    {
        entryPoints: ['src/core/backend/web-worker/web.worker.ts'],
        platform: 'browser',
        outfile: 'lib/web.worker.js',
    },
    {
        entryPoints: ['src/core/backend/web-worker/web.wasm.worker.ts'],
        platform: 'browser',
        outfile: 'lib/web.wasm.worker.js',
    },
    {
        entryPoints: ['src/core/backend/synckit/synckit.worker.ts'],
        platform: 'node',
        outfile: 'lib/synckit.worker.js',
    },
];

const inlineWorkerFactories: BuildOptions[] = [
    {
        entryPoints: ['src/core/backend/thread-worker/create-inline-worker.ts'],
        platform: 'node',
        outfile: 'lib/core/backend/thread-worker/create-inline-worker.js',
        plugins: [esbuildLoaderPlugin],
    },
    {
        entryPoints: ['src/core/backend/web-worker/create-inline-worker.ts'],
        platform: 'browser',
        outfile: 'lib/core/backend/web-worker/create-inline-worker.js',
        plugins: [esbuildLoaderPlugin],
    },
];

async function getEntryPoints() {
    const filters = ['create-inline-worker.ts', '.worker.ts', 'browser.ts'];
    const entries: string[] = [];
    for await (const entry of glob('src/core/**/*.ts')) {
        if (filters.every((filter) => !entry.endsWith(filter))) {
            entries.push(entry);
        }
    }
    return entries;
}

const main = async () => {
    for (const options of workers) {
        await build(options);
    }
    await build({
        entryPoints: await getEntryPoints(),
        bundle: false,
        platform: 'node',
        outbase: 'src',
        outdir: 'lib',
    });
    await build({
        bundle: false,
        entryPoints: ['src/browser.ts'],
        platform: 'browser',
        outfile: 'lib/browser.js',
    });
    for (const options of inlineWorkerFactories) {
        await build(options);
    }
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
