import { Firestore } from "../../../../src/adaptors/firestore/mongodb";

describe("Firestore to Mongo", () => {
  beforeEach(() => {
    jest.spyOn(process, "hrtime").mockReturnValue([1, 2]);
    Date.prototype.getTime = jest.fn().mockReturnValue(1000);
  });

  it("should return correct nano sec time when call getNanoSecTime", () => {
    const nanoSecTime = new Firestore().getNanoSecTime();

    expect(nanoSecTime).toEqual(1 * 1000000000 + 2);
  });

  it("should return correct server timestamp when call serverTimestamp", () => {
    const serverTimestamp = new Firestore().serverTimestamp();

    expect(serverTimestamp).toEqual({
      _seconds: 1,
      nanoseconds: 1 * 1000000000 + 2,
    });
  });

  it("should return this when call firestore", () => {
    const firestore = new Firestore();

    expect(firestore.firestore()).toEqual(firestore);
  });
});
