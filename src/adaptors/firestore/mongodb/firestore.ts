import { Firestore as FirestoreInterface } from "@google-cloud/firestore";
import { CollectionReference } from "./collection";
import { WriteBatch } from "./transaction";

export class Firestore implements FirestoreInterface {
  options?: FirebaseFirestore.Settings;

  serverTimestamp(): { _seconds: number; nanoseconds: number } {
    return {
      _seconds: new Date().getTime() / 1000,
      nanoseconds: this.getNanoSecTime(),
    };
  }

  getNanoSecTime(): number {
    const hrTime = process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1];
  }

  firestore(): Firestore {
    return this;
  }

  collection(
    collectionPath: string
  ): CollectionReference<FirebaseFirestore.DocumentData> {
    return new CollectionReference(collectionPath, this.options);
  }

  batch(): WriteBatch {
    return new WriteBatch(this.options);
  }

  settings(settings: FirebaseFirestore.Settings): void {
    this.options = settings;
  }

  // unimplement
  doc(
    documentPath: string
  ): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
    throw new Error("Method not implemented.");
  }
  collectionGroup(
    collectionId: string
  ): FirebaseFirestore.CollectionGroup<FirebaseFirestore.DocumentData> {
    throw new Error("Method not implemented.");
  }
  getAll(
    ...documentRefsOrReadOptions: (
      | FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
      | FirebaseFirestore.ReadOptions
    )[]
  ): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>[]> {
    throw new Error("Method not implemented.");
  }
  recursiveDelete(
    ref:
      | FirebaseFirestore.CollectionReference<unknown>
      | FirebaseFirestore.DocumentReference<unknown>,
    bulkWriter?: FirebaseFirestore.BulkWriter | undefined
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  terminate(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  listCollections(): Promise<
    FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>[]
  > {
    throw new Error("Method not implemented.");
  }
  runTransaction<T>(
    updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>,
    transactionOptions?:
      | FirebaseFirestore.ReadWriteTransactionOptions
      | FirebaseFirestore.ReadOnlyTransactionOptions
      | undefined
  ): Promise<T> {
    throw new Error("Method not implemented.");
  }
  bulkWriter(
    options?: FirebaseFirestore.BulkWriterOptions | undefined
  ): FirebaseFirestore.BulkWriter {
    throw new Error("Method not implemented.");
  }
  bundle(bundleId?: string | undefined): FirebaseFirestore.BundleBuilder {
    throw new Error("Method not implemented.");
  }
}
