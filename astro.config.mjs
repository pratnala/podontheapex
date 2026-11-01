import { readFile, writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import { transform } from 'esbuild';

// Browsers look for updates at /sw.min.js, so this output path must not change
const minifyServiceWorker = {
    name: 'minify-service-worker',
    hooks: {
        'astro:build:done': async ({ dir }) => {
            const source = await readFile(new URL('./src/scripts/sw.js', import.meta.url), 'utf8');
            const { code } = await transform(source, { minify: true });
            await writeFile(new URL('sw.min.js', dir), code);
        }
    }
};

export default defineConfig({
    site: 'https://www.podontheapex.com',
    trailingSlash: 'never',
    build: {
        format: 'file'
    },
    integrations: [minifyServiceWorker]
});
