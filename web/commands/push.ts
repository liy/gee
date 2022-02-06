export const push = async (workingDirectory: string) => {
  const result = await window.command.invoke(['git', 'push'], workingDirectory);
  console.log(result);
  return result;

  // return new Promise((resolve, reject) => {
  //   const lines: string[] = [];
  //   window.command.submit(['git', 'push'], workingDirectory, {
  //     onReadLine: (lineText: string) => {
  //       lines.push(lineText);
  //     },
  //     onClose: async () => {
  //       console.log(lines);
  //       resolve(lines);
  //     },
  //     onError: () => {
  //       reject();
  //     },
  //   });
  // });
};
