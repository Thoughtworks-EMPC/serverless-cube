import {
  DocumentData,
  DocumentSnapshot as DocumentSnapshotInterface,
} from "@google-cloud/firestore";
import { WithId, Document } from "mongodb";

export class DocumentSnapshot<T = DocumentData> implements DocumentSnapshotInterface<T> {
  documentData: T;
  exists: boolean;
  id: string;

  constructor(data: WithId<Document> | null) {
    this.exists = data !== null;
    this.documentData = (data ? data : {}) as T;
    this.id = "";
    if (data) {
      const pathArray = data._id.toString().split("|");
      if (pathArray.length > 0) {
        this.id = pathArray.pop() as string;
      }
    }
  }

  data(): T {
    return this.documentData;
  }

  ref!: FirebaseFirestore.DocumentReference<T>;
  createTime?: FirebaseFirestore.Timestamp | undefined;
  updateTime?: FirebaseFirestore.Timestamp | undefined;
  readTime!: FirebaseFirestore.Timestamp;

  get(fieldPath: string | FirebaseFirestore.FieldPath) {
    throw new Error("Method not implemented.");
  }
  isEqual(other: DocumentSnapshotInterface<T>): boolean {
    throw new Error("Method not implemented.");
  }
}
