const argv = require('minimist')(process.argv.slice(2));
const sassPlugin = require('esbuild-plugin-sass');
/* eslint-disable @typescript-eslint/no-var-requires */

require('esbuild')
  .build({
    entryPoints: ['web/index.ts'],
    bundle: true,
    sourcemap: true,
    watch: argv.watch && {
      onRebuild(error, result) {
        if (error) console.error('web build failed:', error);
        else console.log('web updated');
      },
    },
    format: 'esm',
    outdir: 'dist',
    define: {
      'process.env.NODE_ENV': '"development"',
    },
    plugins: [sassPlugin()],
  })
  .then(() => {
    argv.watch && console.log('Watching web folder changes...');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
