import { RepositoryServiceClient } from './protobuf/pb/RepositoryService';
import { ProtoGrpcType } from './protobuf/messages';
import loader = require('@grpc/proto-loader');
import fs from 'fs';
import grpc from '@grpc/grpc-js';
import { Repository } from 'protobuf/pb/Repository';
import { Head } from 'protobuf/pb/Head';

class RPC {
  private client: RepositoryServiceClient;
  constructor() {
    const packageDefinition = loader.loadSync('./protobuf/messages.proto', {
      // empty array in grpc will be retained as [], not undefined
      arrays: true,
    });
    const pkg = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
    //   const Client  = pkg.pb.RepositoryService;
    const cacert = fs.readFileSync('./certificates/ca.crt');
    const cert = fs.readFileSync('./certificates/client.crt');
    const key = fs.readFileSync('./certificates/client.key');
    const kvpair = {
      private_key: key,
      cert_chain: cert,
    };
    const creds = grpc.credentials.createSsl(cacert, key, cert);

    this.client = new pkg.pb.RepositoryService(`Perceptron-PC:${8888}`, creds, {
      'grpc.max_receive_message_length': 20 * 1024 * 1024,
    });
  }

  getRepository(): Promise<Repository | null | undefined> {
    const md = new grpc.Metadata();
    md.add('path', '../repos/checkout');

    return new Promise<Repository | null | undefined>((resolve, reject) => {
      this.client.getRepository({}, md, (err, response) => {
        if (err) reject(err);
        resolve(response?.repository);
      });
    });
  }

  getHead(): Promise<Head | null | undefined> {
    const md = new grpc.Metadata();
    md.add('path', '../repos/checkout');

    return new Promise<Head | null | undefined>((resolve, reject) => {
      this.client.getHead({}, md, (err, response) => {
        if (err) reject(err);
        resolve(response?.head);
      });
    });
  }
}

export default new RPC();
