import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { build as esbuild } from 'esbuild';

import type { BuildOptions, Plugin } from 'esbuild';

const isProduction = process.env['NODE_ENV'] === 'production' || process.argv.includes('--production');
const writeMetafile = process.argv.includes('--metafile');

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
        sourcemap: false && !isProduction,
        logLevel: 'error',
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

const main = async () => {
    const workers: BuildOptions[] = [
        {
            entryPoints: ['src/core/backend/thread-worker/thread.worker.ts'],
            platform: 'node',
            outfile: 'lib/thread.worker.js',
        },
        {
            entryPoints: ['src/core/backend/web-worker/web.worker.ts'],
            platform: 'browser',
            outfile: 'lib/web.worker.js',
        },
        {
            entryPoints: ['src/core/backend/web-worker/web.worker.ts'],
            platform: 'browser',
            bundle: true,
            external: [],
            outfile: 'lib/web.worker.bundle.js',
        },
        {
            entryPoints: ['src/core/backend/synckit/synckit.worker.ts'],
            platform: 'node',
            outfile: 'lib/synckit.worker.js',
        },
    ];
    for (const options of workers) {
        await build(options);
    }
    await build({
        entryPoints: ['src/core/index.ts'],
        platform: 'node',
        outbase: 'src',
        outdir: 'lib',
        plugins: [esbuildLoaderPlugin],
    });
    await build({
        bundle: false,
        entryPoints: ['src/index.ts'],
        platform: 'node',
        outfile: 'lib/index.js',
        plugins: [esbuildLoaderPlugin],
    });
    await build({
        bundle: false,
        entryPoints: ['src/browser.ts'],
        platform: 'browser',
        outfile: 'lib/browser.js',
        plugins: [esbuildLoaderPlugin],
    });
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
