import { build, context } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(root, '../../assets/games/wally-circle');
await mkdir(output, { recursive: true });
await copyFile(resolve(root, 'node_modules/three/LICENSE'), resolve(output, 'THREE-LICENSE.txt'));

const options = {
  entryPoints: [resolve(root, 'src/main.js')],
  outfile: resolve(output, 'game.js'),
  bundle: true,
  format: 'esm',
  target: 'es2020',
  minify: true,
  legalComments: 'eof',
  logLevel: 'info',
};

if (process.argv.includes('--watch')) {
  const builder = await context(options);
  await builder.watch();
  console.log('Watching Wally Circle source files. Keep Jekyll running in another terminal.');
} else {
  await build(options);
}
