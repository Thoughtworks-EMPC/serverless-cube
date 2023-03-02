import { DocumentData, QuerySnapshot as QuerySnapshotInterface } from "@google-cloud/firestore";

export class QuerySnapshot<T = DocumentData> implements QuerySnapshotInterface<T> {
  query: FirebaseFirestore.Query<T>;
  docs: FirebaseFirestore.QueryDocumentSnapshot<T>[];
  size: number;
  empty: boolean;
  readTime: FirebaseFirestore.Timestamp;

  constructor(
    query: FirebaseFirestore.Query<T>,
    docs: FirebaseFirestore.QueryDocumentSnapshot<T>[],
    size: number,
    empty: boolean,
    readTime: FirebaseFirestore.Timestamp
  ) {
    this.query = query;
    this.docs = docs;
    this.size = size;
    this.empty = empty;
    this.readTime = readTime;
  }

  docChanges(): FirebaseFirestore.DocumentChange<T>[] {
    throw new Error("Method not implemented.");
  }
  forEach(
    callback: (
      result: FirebaseFirestore.QueryDocumentSnapshot<T>
    ) => void,
    thisArg?: any
  ): void {
    throw new Error("Method not implemented.");
  }
  isEqual(other: QuerySnapshotInterface<T>): boolean {
    throw new Error("Method not implemented.");
  }
}
