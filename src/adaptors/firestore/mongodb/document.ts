import {
  DocumentData,
  DocumentReference as DocumentReferenctInterface,
  Timestamp,
} from "@google-cloud/firestore";
import { MongodbWrapper } from "./mongodbWrapper";
import { CollectionReference } from "./collection";
import { DocumentSnapshot, WriteResult } from "./bases";
import logger from "../../../logger";
import { COMMAND, buildCommand } from "./command";

export class DocumentReference<T = DocumentData>
  implements DocumentReferenctInterface<T>
{
  id: string;
  firestore!: FirebaseFirestore.Firestore;
  parent: CollectionReference<T>;
  path!: string;
  parentName: string;
  parentSettings?: { [key: string]: any };

  constructor(
    id: string,
    parent: CollectionReference<T>,
    parentName: string,
    parentSettings?: { [key: string]: any }
  ) {
    this.id = id;
    this.parent = parent;
    this.parentName = parentName;
    this.parentSettings = parentSettings;
  }

  async set(data: unknown, options?: unknown): Promise<FirebaseFirestore.WriteResult>;
  async set(
    data: FirebaseFirestore.PartialWithFieldValue<FirebaseFirestore.DocumentData>,
    options: FirebaseFirestore.SetOptions
  ): Promise<WriteResult>;
  async set(
    data: FirebaseFirestore.WithFieldValue<FirebaseFirestore.DocumentData>
  ): Promise<WriteResult> {
    const db = this.getDB();
    try {
      const collection = await db.getCollection(this.parentName);
      await buildCommand(COMMAND.UPSERT_ONE).execute(collection, this.id, data);
    } finally {
      await db.close();
    }
    return new WriteResult(Timestamp.now());
  }

  async update(
    data: FirebaseFirestore.UpdateData<T>,
    precondition?: FirebaseFirestore.Precondition | undefined
  ): Promise<WriteResult>;
  async update(
    field: string | FirebaseFirestore.FieldPath,
    value: any,
    ...moreFieldsOrPrecondition: any[]
  ): Promise<WriteResult>;
  async update(
    data: unknown,
    precondition?: unknown,
    ...rest: unknown[]
  ): Promise<WriteResult> {
    await this.set(data);
    return new WriteResult(Timestamp.now());
  }

  async delete(
    precondition?: FirebaseFirestore.Precondition | undefined
  ): Promise<WriteResult> {
    const db = this.getDB();
    try {
      const collection = await db.getCollection(this.parentName);
      await buildCommand(COMMAND.DELETE_ONE).execute(collection, this.id);
    } finally {
      db.close();
    }
    return new WriteResult(Timestamp.now());
  }

  async create(data: FirebaseFirestore.WithFieldValue<T>): Promise<WriteResult> {
    await this.set(data);
    return new WriteResult(Timestamp.now());
  }

  async get(): Promise<DocumentSnapshot<T>> {
    let data;
    const db = this.getDB();
    try {
      const collection = await db.getCollection(this.parentName);
      data = await collection.findOne({ _id: this.id });
      logger.info(`document data: ${JSON.stringify(data)}`);
    } finally {
      db.close();
    }
    return new DocumentSnapshot<T>(data);
  }

  getDB(): MongodbWrapper {
    return new MongodbWrapper(this.parentSettings);
  }

  collection(name: string) {
    return new CollectionReference(
      this.parentName,
      this.parentSettings,
      `${this.id}|${name}`
    );
  }

  // unimplemented
  listCollections(): Promise<
    FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>[]
  > {
    throw new Error("Method not implemented.");
  }
  onSnapshot(
    onNext: (snapshot: FirebaseFirestore.DocumentSnapshot<T>) => void,
    onError?: ((error: Error) => void) | undefined
  ): () => void {
    throw new Error("Method not implemented.");
  }
  isEqual(other: FirebaseFirestore.DocumentReference<T>): boolean {
    throw new Error("Method not implemented.");
  }
  withConverter<U>(
    converter: FirebaseFirestore.FirestoreDataConverter<U>
  ): FirebaseFirestore.DocumentReference<U>;
  withConverter(
    converter: null
  ): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
  withConverter(
    converter: unknown
  ):
    | FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
    | FirebaseFirestore.DocumentReference<any> {
    throw new Error("Method not implemented.");
  }
}
