import { MongoClient, ClientSession, Db, Collection } from "mongodb";
import { MongodbWrapper, COMMAND } from "../../../../src/adaptors/firestore/mongodb";
import { createMock } from "ts-auto-mock";

describe("MongodbWrapper", () => {
  const mockSession = createMock<ClientSession>();
  const mockConnection = createMock<MongoClient>();
  const mockDb = createMock<Db>();
  const mockCollection = createMock<Collection>();

  it("should init MongodbWrapper setting when create a new MongodbWrapper", () => {
    const wrapper = new MongodbWrapper({ ignoreUndefinedProperties: true });

    expect(wrapper.name).toEqual("mongo-db");
    expect(wrapper.url).toEqual(
      "mongodb://127.0.0.1:27027,127.0.0.1:27028,127.0.0.1:27029/test?replicaSet=rs0&connectTimeoutMS=30000&readPreference=primary"
    );
    expect(wrapper.mongoSettings).toEqual({ ignoreUndefined: true });
  });

  it("should return or init connection when call getConnection", async () => {
    const spy = jest
      .spyOn(MongoClient, "connect")
      .mockImplementation(() => Promise.resolve(mockConnection));
    const wrapper = new MongodbWrapper();

    let connection!: MongoClient;
    for (let i = 0; i < 5; i++) {
      connection = await wrapper.getConnection();
    }

    expect(spy).toBeCalledTimes(1);
    expect(connection).toEqual(mockConnection);
  });

  it("should commit transaction when excute without error", async () => {
    const wrapper = new MongodbWrapper();
    wrapper.getConnection = jest.fn().mockResolvedValue(mockConnection);
    wrapper.getCollection = jest.fn().mockResolvedValue(mockCollection);

    mockConnection.startSession = jest.fn().mockReturnValue(mockSession);

    const spyStartTransaction = jest.spyOn(mockSession, "startTransaction");
    const spyCommitTransaction = jest.spyOn(mockSession, "commitTransaction");
    const spyAbortTransaction = jest.spyOn(mockSession, "abortTransaction");
    const spyEndSession = jest.spyOn(mockSession, "endSession");

    const mockOperationModels = [
      {
        docId: "10",
        command: "insertOne",
        docs: [{ _id: 10 }],
      },
    ];

    await wrapper.batch(mockOperationModels);

    expect(spyStartTransaction).toHaveBeenCalled();
    expect(spyCommitTransaction).toHaveBeenCalled();
    expect(spyAbortTransaction).toHaveBeenCalledTimes(0);
    expect(spyEndSession).toHaveBeenCalled();
  });

  it("should abort transaction when excute with error", async () => {
    const wrapper = new MongodbWrapper();
    wrapper.getConnection = jest.fn().mockResolvedValue(mockConnection);
    wrapper.getCollection = jest.fn().mockRejectedValue(new Error());

    mockConnection.startSession = jest.fn().mockReturnValue(mockSession);

    const spyStartTransaction = jest.spyOn(mockSession, "startTransaction");
    const spyCommitTransaction = jest.spyOn(mockSession, "commitTransaction");
    const spyAbortTransaction = jest.spyOn(mockSession, "abortTransaction");
    const spyEndSession = jest.spyOn(mockSession, "endSession");

    const mockOperationModels = [
      {
        docId: "name|10",
        command: "command",
        docs: [{ _id: "name|10" }],
      },
    ];

    await wrapper.batch(mockOperationModels);

    expect(spyStartTransaction).toHaveBeenCalled();
    expect(spyCommitTransaction).toHaveBeenCalledTimes(0);
    expect(spyAbortTransaction).toHaveBeenCalled();
    expect(spyEndSession).toHaveBeenCalled();
  });

  it("should execute correct command when call executeCommand", async () => {
    const wrapper = new MongodbWrapper();
    wrapper.getConnection = jest.fn().mockResolvedValue(mockConnection);

    mockConnection.db = jest.fn().mockReturnValue(mockDb);
    mockDb.collection = jest.fn().mockReturnValue(mockCollection);
    mockConnection.startSession = jest.fn().mockReturnValue(mockSession);

    const spy = jest.spyOn(mockCollection, "updateOne");

    const mockOperationModel = {
      docId: "name|10",
      command: COMMAND.UPSERT_ONE,
      data: { _id: "name|10", color: "red" },
    };

    await wrapper.batch([mockOperationModel]);

    expect(spy).toHaveBeenCalledWith(
      { _id: "name|10" },
      { $set: { color: "red" } },
      {
        upsert: true,
        session: mockSession,
      }
    );
  });
});
