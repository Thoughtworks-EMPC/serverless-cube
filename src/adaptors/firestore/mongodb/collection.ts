import {
  CollectionReference as CollectionReferenceInterface,
  DocumentData,
} from "@google-cloud/firestore";
import { QuerySnapshot } from "./bases";
import { DocumentReference } from "./document";
import { Query } from "./query";

export class CollectionReference<T = DocumentData>
  implements CollectionReferenceInterface<T>
{
  name: string;
  settings?: { [key: string]: any };
  id: string;
  parent!: DocumentReference<FirebaseFirestore.DocumentData> | null;
  path!: string;
  firestore!: FirebaseFirestore.Firestore;

  constructor(name: string, settings?: { [key: string]: any }, id?: string) {
    this.name = name;
    this.settings = settings;
    this.id = id ? id : name;
  }

  doc(): DocumentReference<T>;
  doc(documentPath: string): DocumentReference<T>;
  doc(documentPath?: unknown): DocumentReference<T> {
    return new DocumentReference<T>(
      `${this.id}|${documentPath}`,
      this,
      this.name,
      this.settings
    );
  }

  where(
    fieldPath: string | FirebaseFirestore.FieldPath,
    opStr: FirebaseFirestore.WhereFilterOp,
    value: any
  ): Query<T> {
    return new Query<T>(this.name, this.id, fieldPath, opStr, value);
  }

  async get(): Promise<QuerySnapshot<T>> {
    return new Query<T>(this.name, this.id).get();
  }

  orderBy(
    fieldPath: string | FirebaseFirestore.FieldPath,
    directionStr?: FirebaseFirestore.OrderByDirection | undefined
  ): Query<T> {
    return new Query<T>(this.name, this.id).orderBy(fieldPath, directionStr);
  }

  limit(limit: number): Query<T> {
    return new Query<T>(this.name, this.id).limit(limit);
  }

  // unimplement
  listDocuments(): Promise<FirebaseFirestore.DocumentReference<T>[]> {
    throw new Error("Method not implemented.");
  }
  add(
    data: FirebaseFirestore.WithFieldValue<T>
  ): Promise<FirebaseFirestore.DocumentReference<T>> {
    throw new Error("Method not implemented.");
  }
  isEqual(other: CollectionReferenceInterface<T>): boolean {
    throw new Error("Method not implemented.");
  }
  withConverter<U>(
    converter: FirebaseFirestore.FirestoreDataConverter<U>
  ): CollectionReferenceInterface<U>;
  withConverter(
    converter: null
  ): CollectionReferenceInterface<FirebaseFirestore.DocumentData>;
  withConverter(
    converter: unknown
  ):
    | CollectionReferenceInterface<FirebaseFirestore.DocumentData>
    | CollectionReferenceInterface<any> {
    throw new Error("Method not implemented.");
  }
  limitToLast(limit: number): FirebaseFirestore.Query<T> {
    throw new Error("Method not implemented.");
  }
  offset(offset: number): FirebaseFirestore.Query<T> {
    throw new Error("Method not implemented.");
  }
  select(
    ...field: (string | FirebaseFirestore.FieldPath)[]
  ): FirebaseFirestore.Query<FirebaseFirestore.DocumentData> {
    throw new Error("Method not implemented.");
  }
  startAt(snapshot: FirebaseFirestore.DocumentSnapshot<any>): FirebaseFirestore.Query<T>;
  startAt(...fieldValues: any[]): FirebaseFirestore.Query<T>;
  startAt(snapshot?: unknown, ...rest: unknown[]): FirebaseFirestore.Query<T> {
    throw new Error("Method not implemented.");
  }
  startAfter(
    snapshot: FirebaseFirestore.DocumentSnapshot<any>
  ): FirebaseFirestore.Query<T>;
  startAfter(...fieldValues: any[]): FirebaseFirestore.Query<T>;
  startAfter(snapshot?: unknown, ...rest: unknown[]): FirebaseFirestore.Query<T> {
    throw new Error("Method not implemented.");
  }
  endBefore(
    snapshot: FirebaseFirestore.DocumentSnapshot<any>
  ): FirebaseFirestore.Query<T>;
  endBefore(...fieldValues: any[]): FirebaseFirestore.Query<T>;
  endBefore(snapshot?: unknown, ...rest: unknown[]): FirebaseFirestore.Query<T> {
    throw new Error("Method not implemented.");
  }
  endAt(snapshot: FirebaseFirestore.DocumentSnapshot<any>): FirebaseFirestore.Query<T>;
  endAt(...fieldValues: any[]): FirebaseFirestore.Query<T>;
  endAt(snapshot?: unknown, ...rest: unknown[]): FirebaseFirestore.Query<T> {
    throw new Error("Method not implemented.");
  }
  stream(): NodeJS.ReadableStream {
    throw new Error("Method not implemented.");
  }
  onSnapshot(
    onNext: (snapshot: FirebaseFirestore.QuerySnapshot<T>) => void,
    onError?: ((error: Error) => void) | undefined
  ): () => void {
    throw new Error("Method not implemented.");
  }
  count(): FirebaseFirestore.AggregateQuery<{
    count: FirebaseFirestore.AggregateField<number>;
  }> {
    throw new Error("Method not implemented.");
  }
}
