import { DocumentData, QueryDocumentSnapshot as QueryDocumentSnapshotInterface } from "@google-cloud/firestore";

export class QueryDocumentSnapshot<T = DocumentData> implements QueryDocumentSnapshotInterface<T> {
  id: string;
  ref: FirebaseFirestore.DocumentReference<T>;
  documentData: T;

  constructor(
    id: string | undefined = "",
    ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
    data: T
  ) {
    this.id = "";
    if (id) {
      const pathArray = id.toString().split("|");
      if (pathArray.length > 0) {
        this.id = pathArray.pop() as string;
      }
    }
    this.ref = ref as FirebaseFirestore.DocumentReference<T>;
    this.documentData = data;
  }

  data(): T {
    return this.documentData;
  }

  createTime!: FirebaseFirestore.Timestamp;
  updateTime!: FirebaseFirestore.Timestamp;
  exists!: boolean;
  readTime!: FirebaseFirestore.Timestamp;

  get(fieldPath: string | FirebaseFirestore.FieldPath) {
    throw new Error("Method not implemented.");
  }
  isEqual(
    other: FirebaseFirestore.DocumentSnapshot<T>
  ): boolean {
    throw new Error("Method not implemented.");
  }
}
