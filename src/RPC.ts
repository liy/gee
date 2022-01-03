const grpc = require('@grpc/grpc-js');
import { Head__Output } from 'protobuf/pb/Head';
import { Repository__Output } from 'protobuf/pb/Repository';
import { ProtoGrpcType } from './protobuf/messages';
import { RepositoryServiceClient } from './protobuf/pb/RepositoryService';
const loader = require('@grpc/proto-loader');
const path = require('path');

class RPC {
  private client: RepositoryServiceClient;
  constructor() {
    const packageDefinition = loader.loadSync(path.join(__dirname, require('../protobuf/messages.proto')), {
      // empty array in grpc will be retained as [], not undefined
      arrays: true,
    });
    const pkg = grpc.loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;
    this.client = new pkg.pb.RepositoryService('localhost:18888', grpc.credentials.createInsecure());
  }

  getRepository(path: string) {
    return new Promise<Repository__Output | null | undefined>((resolve, reject) => {
      this.client.getRepository({ path }, (err, response) => {
        console.log(err, response?.repository);
        if (err) reject(err);

        resolve(response?.repository);
      });
    });
  }

  getHead(path: string) {
    return new Promise<Head__Output | null | undefined>((resolve, reject) => {
      this.client.getHead({ path }, (err, response) => {
        if (err) reject(err);
        resolve(response?.head);
      });
    });
  }
}

export default new RPC();
