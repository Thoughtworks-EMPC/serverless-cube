import { DocumentData } from "@google-cloud/firestore";

export default class DataTransformer {
  // 1. mongo don't support for using $set with empty object like '{}' before v5.0
  // 2. can't contain _id field when update
  static execute(data?: DocumentData): DocumentData {
    return this.isEmpty(data)
      ? { _update_time: Date.now() }
      : this.discardProperty(data as DocumentData, "_id");
  }

  private static isEmpty(data?: DocumentData): boolean {
    return !data || Object.keys(data).length === 0 ;
  }

  private static discardProperty(data: DocumentData, property: string): DocumentData {
    const { [property]: unused, ...rest } = data;
    return rest;
  }
}
