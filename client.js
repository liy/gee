const loader = require('@grpc/proto-loader');
const fs = require('fs');
const process = require('process');
const grpc = require('@grpc/grpc-js');

loader.load('./protobuf/messages.proto').then((packageDefinition) => {
  const package = grpc.loadPackageDefinition(packageDefinition);
  //   const Client  = package.pb.RepositoryService;
  const cacert = fs.readFileSync('./certificates/ca.crt');
  const cert = fs.readFileSync('./certificates/client.crt');
  const key = fs.readFileSync('./certificates/client.key');
  const kvpair = {
    private_key: key,
    cert_chain: cert,
  };
  const creds = grpc.credentials.createSsl(cacert, key, cert);
  const client = new package.pb.RepositoryService(`Perceptron-PC:${8888}`, creds, {
    'grpc.max_receive_message_length': 20 * 1024 * 1024,
  });

  const option = parseInt(process.argv[2], 10);
  switch (option) {
    case 1:
      getRepository(client);
      break;
    case 2:
      getHead(client);
    case 3:
      break;
  }
});

function getRepository(client) {
  const md = new grpc.Metadata();
  md.add('path', './repo');

  client.getRepository({}, md, (err, response) => {
    console.log(response, err);
  });
}

function getHead(client) {
  const md = new grpc.Metadata();
  md.add('path', './repo');

  client.getHead({}, md, (err, response) => {
    console.log(response, err);
  });
}

// function getCommits(client) {
//   const md = new grpc.Metadata();
//   md.add('path', './repo');

//   const call = client.getCommits({}, md);

//   call.on('data', (data) => {
//     console.log(data.commits);
//   });
// }
