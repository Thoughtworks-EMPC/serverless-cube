import {
  MongoClient,
  Document,
  OptionalUnlessRequiredId,
  ClientSession,
  MongoClientOptions,
  Db,
} from "mongodb";
import { WriteResult } from "./bases";
import { Timestamp, DocumentData } from "@google-cloud/firestore";
import logger from "../../../logger";
import { buildCommand } from "./command";

export type OperationModel<TSchema extends Document = Document> = {
  docId: string;
  command: string;
  data?: OptionalUnlessRequiredId<TSchema> | OptionalUnlessRequiredId<TSchema>[];
};

export class MongodbWrapper {
  private mongoClient!: MongoClient;
  name: string;
  mongoSettings: MongoClientOptions = {};
  url: string;

  constructor(settings?: { [key: string]: any }) {
    this.name = process.env.MONGO_DB || "mongo-db";
    this.url =
      process.env.MONGO_URL ||
      "mongodb://127.0.0.1:27027,127.0.0.1:27028,127.0.0.1:27029/test?replicaSet=rs0&connectTimeoutMS=30000&readPreference=primary";
    if (settings && settings.ignoreUndefinedProperties) {
      this.mongoSettings.ignoreUndefined = settings.ignoreUndefinedProperties;
    }
  }

  async getCollection(collectionName: string) {
    const client = await this.getConnection();
    return client.db(this.name).collection(collectionName);
  }

  async getConnection(): Promise<MongoClient> {
    if (!this.mongoClient) {
      this.mongoClient = await MongoClient.connect(this.url, this.mongoSettings);
      logger.info("MongoDB has connected successfully");
    }
    return this.mongoClient;
  }

  async getDb(): Promise<Db> {
    const client = await this.getConnection();
    return client.db(this.name);
  }

  async close() {
    const client = await this.getConnection();
    await client.close();
  }

  async batch<TSchema extends Document = Document>(
    operations: OperationModel<TSchema>[]
  ): Promise<WriteResult[]> {
    const client = await this.getConnection();
    const session = client.startSession();
    const writeResults: WriteResult[] = [];
    try {
      session.startTransaction({
        readConcern: { level: "local" },
        writeConcern: { w: "majority" },
        readPreference: "primary",
      });

      for (const operationModel of operations) {
        const writeResult = await this.executeCommand(operationModel, session);
        writeResults.push(writeResult);
      }

      await session.commitTransaction();
      logger.info("Transaction successfully committed.");
    } catch (error) {
      logger.info(
        `An error occured in the transaction, performing a data rollback:${error}`
      );
      await session.abortTransaction();
    } finally {
      await session.endSession();
      await client.close();
    }

    return writeResults;
  }

  private async executeCommand<TSchema extends Document = Document>(
    operationModel: OperationModel<TSchema>,
    session: ClientSession
  ): Promise<WriteResult> {
    const { docId, command, data } = operationModel;
    const collection = await this.getCollection(docId.split("|")[0]);

    await buildCommand(command).execute(collection, docId, data as DocumentData, session);

    return new WriteResult(Timestamp.now());
  }
}
