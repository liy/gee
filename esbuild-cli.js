const argv = require('minimist')(process.argv.slice(2));

/* eslint-disable @typescript-eslint/no-var-requires */
require('esbuild')
  .build({
    entryPoints: ['bin/cli.ts'],
    bundle: true,
    sourcemap: true,
    watch: argv.watch && {
      onRebuild(error, result) {
        if (error) console.error('cli build failed:', error);
        else console.log('cli updated');
      },
    },
    external: ['nodegit', 'electron'],
    platform: 'node',
    outdir: 'dist',
  })
  .then(() => {
    argv.watch && console.log('cli successfully built.');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
