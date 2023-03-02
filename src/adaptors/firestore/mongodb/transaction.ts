import { WriteBatch as WriteBatchInterface } from "@google-cloud/firestore";
import { MongodbWrapper, OperationModel } from "./mongodbWrapper";
import { COMMAND } from "./command";
import { WriteResult } from "./bases";

export class WriteBatch implements WriteBatchInterface {
  operations: OperationModel[] = [];
  settings?: { [key: string]: any };

  constructor(settings?: { [key: string]: any }) {
    this.settings = settings;
  }

  set<T>(
    documentRef: FirebaseFirestore.DocumentReference<T>,
    data: FirebaseFirestore.PartialWithFieldValue<T>,
    options: FirebaseFirestore.SetOptions
  ): WriteBatch;
  set<T>(
    documentRef: FirebaseFirestore.DocumentReference<T>,
    data: FirebaseFirestore.WithFieldValue<T>
  ): WriteBatch;
  set(documentRef: unknown, data: unknown, options?: unknown): WriteBatch {
    this.storeOperation(documentRef, COMMAND.UPSERT_ONE, data);
    return this;
  }

  update<T>(
    documentRef: FirebaseFirestore.DocumentReference<T>,
    data: FirebaseFirestore.UpdateData<T>,
    precondition?: FirebaseFirestore.Precondition | undefined
  ): WriteBatch;
  update(
    documentRef: FirebaseFirestore.DocumentReference<any>,
    field: string | FirebaseFirestore.FieldPath,
    value: any,
    ...fieldsOrPrecondition: any[]
  ): WriteBatch;
  update(
    documentRef: unknown,
    data: unknown,
    precondition?: unknown,
    ...rest: unknown[]
  ): WriteBatch {
    this.storeOperation(documentRef, COMMAND.UPDATE_ONE, data);
    return this;
  }

  delete(
    documentRef: FirebaseFirestore.DocumentReference<any>,
    precondition?: FirebaseFirestore.Precondition | undefined
  ): WriteBatch {
    this.storeOperation(documentRef, COMMAND.DELETE_ONE);
    return this;
  }

  async commit(): Promise<WriteResult[]> {
    return new MongodbWrapper(this.settings).batch(this.operations);
  }

  private storeOperation(
    documentRef: FirebaseFirestore.DocumentReference<any> | unknown,
    command: string,
    data?: unknown
  ) {
    const operation: OperationModel = {
      docId: (documentRef as FirebaseFirestore.DocumentReference).id,
      command,
    };
    if (data && typeof data === "object") {
      operation.data = data;
    }
    this.operations.push(operation);
  }

  // unimplement
  create<T>(
    documentRef: FirebaseFirestore.DocumentReference<T>,
    data: FirebaseFirestore.WithFieldValue<T>
  ): WriteBatch {
    throw new Error("Method not implemented.");
  }
}
