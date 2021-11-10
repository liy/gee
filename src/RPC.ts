import { RepositoryServiceClient } from './protobuf/pb/RepositoryService';
import { ProtoGrpcType } from './protobuf/messages';
import loader from '@grpc/proto-loader';
import fs from 'fs';
import grpc from '@grpc/grpc-js';
import { Repository, Repository__Output } from 'protobuf/pb/Repository';
import { Head, Head__Output } from 'protobuf/pb/Head';
const path = require('path');

class RPC {
  private client: RepositoryServiceClient;
  constructor() {
    const packageDefinition = loader.loadSync(path.join(__dirname, require('../protobuf/messages.proto')), {
      // empty array in grpc will be retained as [], not undefined
      arrays: true,
    });
    const pkg = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
    //   const Client  = pkg.pb.RepositoryService;
    const cacert = fs.readFileSync(path.join(__dirname, require('../certificates/ca.crt')));
    const cert = fs.readFileSync(path.join(__dirname, require('../certificates/client.crt')));
    const key = fs.readFileSync(path.join(__dirname, require('../certificates/client.key')));
    const kvpair = {
      private_key: key,
      cert_chain: cert,
    };
    const creds = grpc.credentials.createSsl(cacert, key, cert);

    this.client = new pkg.pb.RepositoryService(`Perceptron-PC:${8888}`, creds, {
      'grpc.max_receive_message_length': 20 * 1024 * 1024,
    });
  }

  getRepository(repoPath: string) {
    const md = new grpc.Metadata();
    md.add('path', repoPath || '../repos/checkout');

    return new Promise<Repository__Output | null | undefined>((resolve, reject) => {
      this.client.getRepository({}, md, (err, response) => {
        if (err) reject(err);
        resolve(response?.repository);
      });
    });
  }

  getHead() {
    const md = new grpc.Metadata();
    md.add('path', '../repos/checkout');

    return new Promise<Head__Output | null | undefined>((resolve, reject) => {
      this.client.getHead({}, md, (err, response) => {
        if (err) reject(err);
        resolve(response?.head);
      });
    });
  }
}

export default new RPC();
