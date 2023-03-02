import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Collection } from "mongodb";
import {  DocumentData, DocumentReference, CollectionReference } from "@google-cloud/firestore";
import { Firestore } from "../../../../src/adaptors/firestore/mongodb";

describe("test with mongodb-memory-server", () => {
  let mongoMemoryServer: MongoMemoryReplSet;

  beforeEach(async () => {
    mongoMemoryServer = await MongoMemoryReplSet.create({
      replSet: { count: 2 },
    });
    process.env["MONGO_URL"] = mongoMemoryServer.getUri();
    process.env["MONGO_DB"] = "appdb";
  });

  afterEach(async () => {
    await mongoMemoryServer.stop();
  });

  describe("document test", () => {
    let firestore: Firestore;
    let collection: CollectionReference<DocumentData>;
    let document: DocumentReference;

    beforeEach(() => {
      firestore = new Firestore();
      collection = firestore.collection("collection");
      document = collection.doc("doc");
    });

    it("should insert a doc", async () => {
      const mockData = { name: "test", age: 20 };
      await document.create(mockData);

      const documentSnapshot = await document.get();

      expect(documentSnapshot.exists).toBeTruthy();
      expect(documentSnapshot.data()).toEqual({
        _id: "collection|doc",
        ...mockData,
      });
      expect(documentSnapshot.id).toEqual("doc");
    });

    it("should update a doc", async () => {
      const mockData = { name: "test_update", age: 20 };
      await document.update(mockData);

      const documentSnapshot = await document.get();

      expect(documentSnapshot.exists).toBeTruthy();
      expect(documentSnapshot.data()).toEqual({
        _id: "collection|doc",
        ...mockData,
      });
      expect(documentSnapshot.id).toEqual("doc");
    });

    it("should delete a doc", async () => {
      const mockData = { name: "test", age: 20 };
      await document.create(mockData);

      await document.delete();

      const documentSnapshot = await document.get();

      expect(documentSnapshot.exists).toBeFalsy();
    });

    it("should remove _id when call set method", async () => {
      const mockData = { name: "test", age: 20 };
      await document.create({ _id: "mock_id", ...mockData });

      let documentSnapshot = await document.get();

      expect(documentSnapshot.exists).toBeTruthy();
      expect(documentSnapshot.data()).toEqual({
        _id: "collection|doc",
        ...mockData,
      });
      expect(documentSnapshot.id).toEqual("doc");

      await document.update({ _id: 123, name: "test_update" });

      documentSnapshot = await document.get();

      expect(documentSnapshot.exists).toBeTruthy();
      expect(documentSnapshot.data()).toEqual({
        _id: "collection|doc",
        ...mockData,
        name: "test_update",
      });
      expect(documentSnapshot.id).toEqual("doc");
    });

    it("should support for setting empty object", async () => {
      Date.now = jest.fn().mockReturnValue(1);
      await document.set({});

      const documentSnapshot = await document.get();

      expect(documentSnapshot.exists).toBeTruthy();
      expect(documentSnapshot.data()).toEqual({
        _id: "collection|doc",
        _update_time: 1, 
      });
      expect(documentSnapshot.id).toEqual("doc");
    });
  });

  describe("collection test", () => {
    let firestore: Firestore;
    let collection: CollectionReference;

    beforeEach(async () => {
      firestore = new Firestore();
      collection = firestore.collection("collection");

      await collection.doc("doc1").create({ name: "test1", age: 10 });
      await collection
        .doc("doc2")
        .create({ name: "test2", age: 20, hobbies: ["a", "b", "c"] });
      await collection
        .doc("doc3")
        .create({ name: "test3", age: 30, hobbies: ["c", "d", "e"] });
      await collection
        .doc("doc4")
        .create({ name: "test4", age: 30, hobbies: ["c", "e"] });
      await collection
        .doc("doc5")
        .create({ name: "test5", age: 40, hobbies: ["f", "g"] });
    });

    it("should return all docs in collection", async () => {
      const querySnapshot = await collection.get();

      expect(querySnapshot.empty).toBeFalsy();
      expect(querySnapshot.size).toEqual(5);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc1",
        name: "test1",
        age: 10,
      });
      expect(querySnapshot.docs[0].id).toEqual("doc1");
    });

    it("should return docs that match '>=' and 'array-contains-any' conditions", async () => {
      const querySnapshot = await collection
        .where("age", ">=", 20)
        .where("hobbies", "array-contains-any", ["b", "d"])
        .get();

      expect(querySnapshot.empty).toBeFalsy();
      expect(querySnapshot.size).toEqual(2);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc2",
        name: "test2",
        age: 20,
        hobbies: ["a", "b", "c"],
      });
      expect(querySnapshot.docs[0].id).toEqual("doc2");
      expect(querySnapshot.docs[1].data()).toEqual({
        _id: "collection|doc3",
        name: "test3",
        age: 30,
        hobbies: ["c", "d", "e"],
      });
      expect(querySnapshot.docs[1].id).toEqual("doc3");
    });

    it("should return docs that match '>=' and 'array-contains' conditions", async () => {
      const querySnapshot = await collection
        .where("age", ">=", 20)
        .where("hobbies", "array-contains", ["c", "e"])
        .get();

      expect(querySnapshot.empty).toBeFalsy();
      expect(querySnapshot.size).toEqual(2);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc3",
        name: "test3",
        age: 30,
        hobbies: ["c", "d", "e"],
      });
      expect(querySnapshot.docs[0].id).toEqual("doc3");
      expect(querySnapshot.docs[1].data()).toEqual({
        _id: "collection|doc4",
        name: "test4",
        age: 30,
        hobbies: ["c", "e"],
      });
      expect(querySnapshot.docs[1].id).toEqual("doc4");
    });

    it("should sort by age asc", async () => {
      const querySnapshot = await collection.where("age", ">", 10).orderBy("age").get();

      expect(querySnapshot.empty).toBeFalsy();
      expect(querySnapshot.size).toEqual(4);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc2",
        name: "test2",
        age: 20,
        hobbies: ["a", "b", "c"],
      });
      expect(querySnapshot.docs[0].id).toEqual("doc2");
    });

    it("should sort by age desc", async () => {
      const querySnapshot = await collection
        .where("age", ">", 10)
        .orderBy("age", "desc")
        .get();

      expect(querySnapshot.empty).toBeFalsy();
      expect(querySnapshot.size).toEqual(4);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc5",
        name: "test5",
        age: 40,
        hobbies: ["f", "g"],
      });
      expect(querySnapshot.docs[0].id).toEqual("doc5");
    });

    it("should sort by age desc and by name asc", async () => {
      const querySnapshot = await collection
        .where("age", ">", 10)
        .orderBy("age", "desc")
        .orderBy("name")
        .get();

      expect(querySnapshot.empty).toBeFalsy();
      expect(querySnapshot.size).toEqual(4);
      expect(querySnapshot.docs[1].data()).toEqual({
        _id: "collection|doc3",
        name: "test3",
        age: 30,
        hobbies: ["c", "d", "e"],
      });
      expect(querySnapshot.docs[1].id).toEqual("doc3");
      expect(querySnapshot.docs[2].data()).toEqual({
        _id: "collection|doc4",
        name: "test4",
        age: 30,
        hobbies: ["c", "e"],
      });
      expect(querySnapshot.docs[2].id).toEqual("doc4");
    });

    it("should return 2 docs when limit 2", async () => {
      const querySnapshot = await collection.limit(2).get();

      expect(querySnapshot.empty).toBeFalsy();
      expect(querySnapshot.size).toEqual(2);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc1",
        name: "test1",
        age: 10,
      });
      expect(querySnapshot.docs[0].id).toEqual("doc1");
    });
  });

  describe("transaction test", () => {
    it("should set multiple docs once", async () => {
      const firestore = new Firestore();
      const batch = firestore.batch();

      const collection = firestore.collection("collection");

      batch.set(collection.doc("doc1"), { name: "test1" });
      batch.set(collection.doc("doc2"), { name: "test2" });
      batch.update(collection.doc("doc2"), { name: "test2_update", age: 20 });
      batch.set(collection.doc("doc3"), { name: "test3" });
      batch.delete(collection.doc("doc3"));
      await batch.commit();

      const querySnapshot = await collection.get();

      expect(querySnapshot.empty).toBeFalsy();
      expect(querySnapshot.size).toEqual(2);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc1",
        name: "test1",
      });
      expect(querySnapshot.docs[1].data()).toEqual({
        _id: "collection|doc2",
        name: "test2_update",
        age: 20,
      });
      expect(querySnapshot.docs[0].id).toEqual("doc1");
      expect(querySnapshot.docs[1].id).toEqual("doc2");
    });

    it("should abort transaction when executed commands throw error", async () => {
      jest.spyOn(Collection.prototype, "deleteOne").mockImplementation(() => {
        throw new Error();
      });

      const firestore = new Firestore();
      const batch = firestore.batch();

      const collection = firestore.collection("collection");

      batch.set(collection.doc("doc1"), { name: "test1" });
      batch.set(collection.doc("doc2"), { name: "test2" });
      batch.set(collection.doc("doc3"), { name: "test3" });
      batch.delete(collection.doc("doc3"));
      await batch.commit();

      const querySnapshot = await collection.get();

      expect(querySnapshot.empty).toBeTruthy();
    });
  });

  describe("multiple level storage test", () => {
    let firestore: Firestore;
    let collection: CollectionReference;

    beforeEach(async () => {
      firestore = new Firestore();
      collection = firestore.collection("collection");
    });

    it("should return docs below given level", async () => {
      await collection.doc("doc1").create({ name: "test1", age: 10 });

      await collection
        .doc("doc1")
        .collection("collection2")
        .doc("doc2")
        .create({ name: "test1", age: 10 });

      let querySnapshot = await collection.get();

      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc1",
        name: "test1",
        age: 10,
      });
      expect(querySnapshot.docs[1].data()).toEqual({
        _id: "collection|doc1|collection2|doc2",
        name: "test1",
        age: 10,
      });

      querySnapshot = await collection
        .doc("doc1")
        .collection("collection2")
        .where("name", "==", "test1")
        .get();

      expect(querySnapshot.size).toEqual(1);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc1|collection2|doc2",
        name: "test1",
        age: 10,
      });
      expect(querySnapshot.docs[0].id).toEqual("doc2");
    });

    it("should return correct docs by document get", async () => {
      await collection
        .doc("doc1")
        .collection("collection2")
        .doc("doc2")
        .collection("collection3")
        .doc("doc3")
        .create({ name: "test", age: 10 });

      const documentSnapshot = await collection
        .doc("doc1")
        .collection("collection2")
        .doc("doc2")
        .collection("collection3")
        .doc("doc3")
        .get();

      expect(documentSnapshot.exists).toBeTruthy();
      expect(documentSnapshot.data()).toEqual({
        _id: "collection|doc1|collection2|doc2|collection3|doc3",
        name: "test",
        age: 10,
      });
      expect(documentSnapshot.id).toEqual("doc3");
    });

    it("should return correct docs by collection get", async () => {
      await collection
        .doc("doc1")
        .collection("collection2")
        .doc("doc2")
        .collection("collection3")
        .doc("doc3")
        .create({ name: "test1", age: 10 });
      await collection
        .doc("doc1")
        .collection("collection2")
        .doc("doc2")
        .collection("collection3")
        .doc("doc4")
        .create({ name: "test2", age: 10 });

      const querySnapshot = await collection
        .doc("doc1")
        .collection("collection2")
        .doc("doc2")
        .collection("collection3")
        .get();

      expect(querySnapshot.size).toEqual(2);
      expect(querySnapshot.docs[0].data()).toEqual({
        _id: "collection|doc1|collection2|doc2|collection3|doc3",
        name: "test1",
        age: 10,
      });
      expect(querySnapshot.docs[0].id).toEqual("doc3");
      expect(querySnapshot.docs[1].data()).toEqual({
        _id: "collection|doc1|collection2|doc2|collection3|doc4",
        name: "test2",
        age: 10,
      });
      expect(querySnapshot.docs[1].id).toEqual("doc4");
    });
  });
});
