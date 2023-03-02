import { createMock } from "ts-auto-mock";
import { Collection } from "mongodb";
import {
  DocumentReference,
  MongodbWrapper,
  CollectionReference,
} from "../../../../src/adaptors/firestore/mongodb";

describe("Document", () => {
  const docId = "collectionName|docName";
  const mockWrapper = createMock<MongodbWrapper>();
  const mockCollection = createMock<Collection>();
  const mockCollectionReference = createMock<CollectionReference>();
  const document = new DocumentReference(docId, mockCollectionReference, "parentName");

  beforeAll(() => {
    document.getDB = jest.fn().mockReturnValue(mockWrapper);
    mockWrapper.getCollection = jest.fn().mockResolvedValue(mockCollection);
  });

  it("should execute upsert command when call set function", async () => {
    const spyUpdateOne = jest.spyOn(mockCollection, "updateOne");
    const spyClose = jest.spyOn(mockWrapper, "close");

    const mockData: { [key: string]: unknown } = { name: "fakeName", age: 18 };
    await document.set(mockData);

    expect(spyUpdateOne).toHaveBeenCalledWith(
      { _id: docId },
      { $set: { ...mockData } },
      { upsert: true }
    );
    expect(spyClose).toHaveBeenCalled();
  });

  it("should modify exists property to true when call get function and return data", async () => {
    const spyFindOne = jest
      .spyOn(mockCollection, "findOne")
      .mockImplementation(() => Promise.resolve({ _id: docId }));
    const spyClose = jest.spyOn(mockWrapper, "close");

    const getResult = await document.get();

    expect(spyFindOne).toHaveBeenCalledWith({ _id: docId });
    expect(spyClose).toHaveBeenCalled();
    expect(getResult.exists).toBeTruthy();
  });

  it("should modify exists property to false when call get function and return empty", async () => {
    const spyFindOne = jest
      .spyOn(mockCollection, "findOne")
      .mockImplementation(() => Promise.resolve(null));
    const spyClose = jest.spyOn(mockWrapper, "close");

    const getResult = await document.get();

    expect(spyFindOne).toHaveBeenCalledWith({ _id: docId });
    expect(spyClose).toHaveBeenCalled();
    expect(getResult.exists).toBeFalsy();
  });
});
