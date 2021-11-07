const loader = require('@grpc/proto-loader');
const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const path = require('path');

const packageDefinition = loader.loadSync('./protobuf/messages.proto', {
  // empty array in grpc will be retained as [], not undefined
  arrays: true,
});
const pkg = grpc.loadPackageDefinition(packageDefinition);
//   const Client  = pkg.pb.RepositoryService;
const cacert = fs.readFileSync('./certificates/ca.crt');
const cert = fs.readFileSync('./certificates/client.crt');
const key = fs.readFileSync('./certificates/client.key');
const kvpair = {
  private_key: key,
  cert_chain: cert,
};
const creds = grpc.credentials.createSsl(cacert, key, cert);

const client = new pkg.pb.RepositoryService(`Perceptron-PC:${8888}`, creds, {
  'grpc.max_receive_message_length': 100 * 1024 * 1024,
});

const repoPath = '../repos/rails/';

const getRepository = () => {
  const md = new grpc.Metadata();
  md.add('path', repoPath);

  const startTime = performance.now();
  return new Promise((resolve, reject) => {
    client.getRepository({}, md, (err, response) => {
      if (err) reject(err);
      resolve(response?.repository);
      console.log((performance.now() - startTime) / 1000);
    });
  });
};

const getHead = () => {
  const md = new grpc.Metadata();
  md.add('path', repoPath);

  return new Promise((resolve, reject) => {
    client.getHead({}, md, (err, response) => {
      if (err) reject(err);
      resolve(response?.head);
    });
  });
};

getRepository().then((repo) => {
  // console.log(repo);
});
