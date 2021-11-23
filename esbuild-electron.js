const argv = require('minimist')(process.argv.slice(2));
/* eslint-disable @typescript-eslint/no-var-requires */
require('esbuild')
  .build({
    entryPoints: ['src/main.ts', 'src/preload.ts'],
    bundle: true,
    sourcemap: true,
    platform: 'node',
    external: ['nodegit', 'electron', 'electron-reload', 'node-pty'],
    outdir: 'dist',
    minify: process.env.NODE_ENV === 'production',
    watch: argv.watch && {
      onRebuild(error, result) {
        if (error) console.error('electron build failed:', error);
        else console.log('electron build successs');
      },
    },
    loader: {
      '.proto': 'file',
      '.crt': 'file',
      '.key': 'file',
    },
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
  })
  .then(() => {
    console.log('Electron successfully built.');
  })
  .then(() => {
    argv.watch && console.log('Watching src folder changes...');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
