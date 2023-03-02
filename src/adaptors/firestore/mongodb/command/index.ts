import { Collection, ClientSession, Document } from "mongodb";
import { DocumentData } from "@google-cloud/firestore";
import logger from "../../../../logger";
import DataTransformer from "../update/dataTransformer";
import { COMMAND } from "./enums";

type U = any;

export interface Command {
  execute(
    collection: Collection,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ): Promise<U>;
}

class InsertOneCommand implements Command {
  async execute(
    collection: Collection<Document>,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ) {
    let result;
    if (session) {
      result = await collection.insertOne(data ? data : {}, { session });
    } else {
      result = await collection.insertOne(data ? data : {});
    }
    logger.info(`A document was inserted with the _id: ${result.insertedId}`);
  }
}

class InsertManyCommand implements Command {
  async execute(
    collection: Collection<Document>,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ) {
    let result;
    if (session) {
      result = await collection.insertMany(
        data ? (Array.isArray(data) ? data : [data]) : [],
        { session }
      );
    } else {
      result = await collection.insertMany(
        data ? (Array.isArray(data) ? data : [data]) : []
      );
    }
    logger.info(`${result.insertedCount} documents were inserted.`);
    for (const id of Object.values(result.insertedIds)) {
      logger.info(`Inserted a document with id ${id}`);
    }
  }
}

class UpsertOneCommand implements Command {
  async execute(
    collection: Collection<Document>,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ) {
    let result;
    if (session) {
      result = await collection.updateOne(
        { _id: docId },
        { $set: DataTransformer.execute(data) },
        {
          upsert: true,
          session,
        }
      );
    } else {
      result = await collection.updateOne(
        { _id: docId },
        { $set: DataTransformer.execute(data) },
        {
          upsert: true,
        }
      );
    }
    logger.info(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
  }
}

class UpdateOneCommand implements Command {
  async execute(
    collection: Collection<Document>,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ) {
    let result;
    if (session) {
      result = await collection.updateOne(
        { _id: docId },
        { $set: DataTransformer.execute(data) },
        { session }
      );
    } else {
      result = await collection.updateOne(
        { _id: docId },
        { $set: DataTransformer.execute(data) }
      );
    }

    logger.info(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
    );
  }
}

class UpdateManyCommand implements Command {
  async execute(
    collection: Collection<Document>,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ) {
    let result;
    if (session) {
      result = await collection.updateMany(
        { _id: docId },
        { $set: DataTransformer.execute(data) },
        { session }
      );
    } else {
      result = await collection.updateMany(
        { _id: docId },
        { $set: DataTransformer.execute(data) }
      );
    }
    logger.info(`Updated ${result.modifiedCount} documents`);
  }
}

class DeleteOneCommand implements Command {
  async execute(
    collection: Collection<Document>,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ) {
    let result;
    if (session) {
      result = await collection.deleteOne({ _id: docId }, { session });
    } else {
      result = await collection.deleteOne({ _id: docId });
    }
    if (result.deletedCount === 1) {
      logger.info("Successfully deleted one document.");
    } else {
      logger.info("No documents matched the query. Deleted 0 documents.");
    }
  }
}

class DeleteManyCommand implements Command {
  async execute(
    collection: Collection<Document>,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ) {
    let result;
    if (session) {
      result = await collection.deleteMany({ _id: docId }, { session });
    } else {
      result = await collection.deleteMany({ _id: docId });
    }
    logger.info(`Deleted ${result.deletedCount} documents`);
  }
}

class DefaultCommand implements Command {
  async execute(
    collection: Collection<Document>,
    docId: string,
    data?: DocumentData,
    session?: ClientSession
  ) {
    throw new Error("it's an unimplemented command");
  }
}

export function buildCommand(command: string): Command {
  switch (command) {
    case COMMAND.INSERT_ONE: {
      return new InsertOneCommand();
    }
    case COMMAND.INSERT_MANY: {
      return new InsertManyCommand();
    }
    case COMMAND.UPSERT_ONE: {
      return new UpsertOneCommand();
    }
    case COMMAND.UPDATE_ONE: {
      return new UpdateOneCommand();
    }
    case COMMAND.UPDATE_MANY: {
      return new UpdateManyCommand();
    }
    case COMMAND.DELETE_ONE: {
      return new DeleteOneCommand();
    }
    case COMMAND.DELETE_MANY: {
      return new DeleteManyCommand();
    }
    default: {
      return new DefaultCommand();
    }
  }
}

export * from "./enums";
