import {
  DocumentData,
  Query as QueryInterface,
  Timestamp,
  WhereFilterOp,
} from "@google-cloud/firestore";
import { SortDirection } from "mongodb";
import { FieldPath } from "./fieldPath";
import { MongodbWrapper } from "./mongodbWrapper";
import { DocumentReference } from "./document";
import { CollectionReference } from "./collection";
import { QuerySnapshot, QueryDocumentSnapshot } from "./bases";

export class Query<T = DocumentData> implements QueryInterface<T> {
  queries: { [key: string]: any }[] = [];
  sort?: { [key: string]: SortDirection };
  limitNumber?: number;
  collectionName: string;
  collectionId: string;
  settings?: { [key: string]: any };
  map!: { [key in WhereFilterOp]: string };

  constructor(
    collectionName: string,
    collectionId: string,
    fieldPath?: string | FirebaseFirestore.FieldPath,
    opStr?: WhereFilterOp,
    value?: any,
    settings?: { [key: string]: any }
  ) {
    this.initOperationMap();
    this.collectionName = collectionName;
    this.collectionId = collectionId;
    this.settings = settings;
    if (fieldPath && opStr && value) {
      this.addQueryCondition(fieldPath, opStr, value);
    }
  }

  where(
    fieldPath: string | FirebaseFirestore.FieldPath,
    opStr: WhereFilterOp,
    value: any
): Query<T> {
    this.addQueryCondition(fieldPath, opStr, value);
    return this;
  }

  async get(): Promise<QuerySnapshot<T>> {
    const docs: QueryDocumentSnapshot<T>[] = [];

    const wrapper = new MongodbWrapper(this.settings);
    try {
      const collection = await wrapper.getCollection(this.collectionName);

      // transfer `|` to `\\|`, because `|` is the special character
      const prefix = this.collectionId.split("|").join("\\|");
      this.queries.push({ _id: { $regex: new RegExp(`^${prefix}`) } });

      let findCursor = collection.find({ $and: this.queries });
      if (this.sort) {
        findCursor = findCursor.sort(this.sort);
      }
      if (this.limitNumber) {
        findCursor = findCursor.limit(this.limitNumber);
      }

      const dataArray = await findCursor.toArray();
      dataArray.forEach((data) => {
        docs.push(
          new QueryDocumentSnapshot<T>(
            data._id.toString(),
            new DocumentReference<DocumentData>(
              data._id.toString(),
              new CollectionReference(this.collectionName, this.settings),
              this.collectionName,
              this.settings
            ),
            data as T
          )
        );
      });
    } finally {
      await wrapper.close();
    }

    return new QuerySnapshot<T>(
      this,
      docs,
      docs.length,
      docs.length === 0,
      Timestamp.now()
    );
  }

  orderBy(
    fieldPath: string | FirebaseFirestore.FieldPath,
    directionStr?: FirebaseFirestore.OrderByDirection | undefined
  ): Query<T> {
    this.sort = {
      ...this.sort,
      [fieldPath as string]: directionStr ? (directionStr === "asc" ? 1 : -1) : 1,
    };
    return this;
  }

  limit(limit: number): Query<T> {
    this.limitNumber = limit;
    return this;
  }

  private initOperationMap() {
    this.map = {
      "<": "$lt",
      ">": "$gt",
      "<=": "$lte",
      ">=": "$gte",
      "!=": "$ne",
      "==": "$eq",
      in: "$in",
      "not-in": "$nin",
      "array-contains": "$all",
      "array-contains-any": "$in",
    };
  }

  private addQueryCondition(
    fieldPath: string | FirebaseFirestore.FieldPath,
    opStr: WhereFilterOp,
    value: any
  ) {
    if (this.isId(fieldPath)) {
      value = `${this.collectionName}|${value}`;
    }
    this.queries.push(this.generateQueryCondition(fieldPath, opStr, value));
  }

  private generateQueryCondition(
    field: string | FirebaseFirestore.FieldPath,
    operator: WhereFilterOp,
    value: any
  ): { [key: string]: any } {
    return { [field as string]: { [this.map[operator]]: value } }; // e.g. { status: { $in: [ "A", "B" ] } }
  }

  private isId(field: string | FirebaseFirestore.FieldPath): boolean {
    return field === FieldPath.documentId();
  }

  // unimplement
  firestore!: FirebaseFirestore.Firestore;
  limitToLast(limit: number): QueryInterface<T> {
    throw new Error("Method not implemented.");
  }
  offset(offset: number): QueryInterface<T> {
    throw new Error("Method not implemented.");
  }
  select(
    ...field: (string | FirebaseFirestore.FieldPath)[]
  ): QueryInterface<FirebaseFirestore.DocumentData> {
    throw new Error("Method not implemented.");
  }
  startAt(snapshot: FirebaseFirestore.DocumentSnapshot<any>): QueryInterface<T>;
  startAt(...fieldValues: any[]): QueryInterface<T>;
  startAt(snapshot?: unknown, ...rest: unknown[]): QueryInterface<T> {
    throw new Error("Method not implemented.");
  }
  startAfter(snapshot: FirebaseFirestore.DocumentSnapshot<any>): QueryInterface<T>;
  startAfter(...fieldValues: any[]): QueryInterface<T>;
  startAfter(snapshot?: unknown, ...rest: unknown[]): QueryInterface<T> {
    throw new Error("Method not implemented.");
  }
  endBefore(snapshot: FirebaseFirestore.DocumentSnapshot<any>): QueryInterface<T>;
  endBefore(...fieldValues: any[]): QueryInterface<T>;
  endBefore(snapshot?: unknown, ...rest: unknown[]): QueryInterface<T> {
    throw new Error("Method not implemented.");
  }
  endAt(snapshot: FirebaseFirestore.DocumentSnapshot<any>): QueryInterface<T>;
  endAt(...fieldValues: any[]): QueryInterface<T>;
  endAt(snapshot?: unknown, ...rest: unknown[]): QueryInterface<T> {
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
  isEqual(other: QueryInterface<T>): boolean {
    throw new Error("Method not implemented.");
  }
  withConverter<U>(
    converter: FirebaseFirestore.FirestoreDataConverter<U>
  ): QueryInterface<U>;
  withConverter(converter: null): QueryInterface<FirebaseFirestore.DocumentData>;
  withConverter(
    converter: unknown
  ): QueryInterface<FirebaseFirestore.DocumentData> | QueryInterface<any> {
    throw new Error("Method not implemented.");
  }
}
