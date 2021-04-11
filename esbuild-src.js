/* eslint-disable @typescript-eslint/no-var-requires */
require('esbuild')
  .build({
    entryPoints: ['src/main.ts', 'src/preload.ts'],
    bundle: true,
    sourcemap: true,
    platform: 'node',
    external: ['nodegit', 'electron', 'electron-reload', 'node-pty'],
    outdir: 'dist',
  })
  .then(() => {
    console.log('Electron successfully built.');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
