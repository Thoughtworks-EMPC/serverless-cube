import { Query, MongodbWrapper } from "../../../../src/adaptors/firestore/mongodb";
import { Collection, FindCursor } from "mongodb";
import { createMock } from "ts-auto-mock";

describe("Where", () => {
  it("should get docs when call get with multi condition", async () => {
    const mockCollection = createMock<Collection>();
    const mockFindCursor = createMock<FindCursor>();

    MongodbWrapper.prototype.getCollection = jest.fn().mockResolvedValue(mockCollection);
    MongodbWrapper.prototype.close = jest.fn();

    const mockData = {
      _id: "collectionName|id",
      name: "targetName",
      age: 20,
      hobbies: ["basketball", "swiming"],
    };

    mockFindCursor.toArray = jest.fn().mockResolvedValue([mockData]);

    const spy = jest.spyOn(mockCollection, "find").mockReturnValue(mockFindCursor);

    const query = new Query(
      "collectionName",
      "collectionName",
      "name",
      "==",
      "targetName"
    )
      .where("_id", "==", "id")
      .where("age", "in", [18, 19, 20])
      .where("hobbies", "array-contains-any", ["basketball", "football"]);

    const result = await query.get();

    expect(result.docs[0].data()).toEqual(mockData);
    expect(spy).toHaveBeenCalledWith({
      $and: [
        { name: { $eq: "targetName" } },
        { _id: { $eq: "collectionName|id" } },
        { age: { $in: [18, 19, 20] } },
        { hobbies: { $in: ["basketball", "football"] } },
        { _id: { $regex: /^collectionName/ } },
      ],
    });
  });
});
