const loader = require('@grpc/proto-loader');
const fs = require('fs');
const process = require('process');
const grpc = require('@grpc/grpc-js');

loader.load('./messages.proto').then((packageDefinition) => {
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
      sendMetadata(client);
      break;
  }
});

function sendMetadata(client) {
  const md = new grpc.Metadata();
  md.add('username', 'liy');
  md.add('password', 'password123');

  client.getRepository({}, md, (err, response) => {
    console.log(response, err);
  });
}
