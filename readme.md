# Compile native module: nodegit and node-pty

0. Use nvm install `node 14.16.1`
1. https://github.com/nodejs/node-gyp#on-windows Make sure Python 2.7 is installed. Visual Studio Build Tools is installed, and set msvs_version to 2017.
2. Install `electron-rebuild`
3. Add `electron-rebuild -f -w <your module>` in scripts section and run the command.
