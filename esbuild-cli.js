/* eslint-disable @typescript-eslint/no-var-requires */
require('esbuild')
  .build({
    entryPoints: ['bin/cli.ts', 'bin/readerProcess.ts'],
    bundle: true,
    sourcemap: true,
    watch: {
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
    console.log('cli successfully built.');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
