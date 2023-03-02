import fs from "fs";
import Translator from "../../src/translate";
import { AnalysisReportUtils } from "../../src/scan";

jest.mock("fs");
const mockFS: jest.Mocked<typeof fs> = <jest.Mocked<typeof fs>>fs;

describe("Translate", () => {
  const mockReadValue = `
  import { Firestore } from "@google-cloud/firestore"
  import { Firestore } from "@google-cloud/firestore"`;
  const expectWriteValue = `
  import { Firestore } from "@tw-cloud/sc/firestoreToMongo"
  import { Firestore } from "@tw-cloud/sc/firestoreToMongo"`;

  beforeEach(() => {
    mockFS.readFileSync.mockReturnValue(mockReadValue);
  });

  it("should return replaced file", () => {
    const mockReport = [
      {
        gcpServiceNameMatcher: "@google-cloud/firestore",
        aliEquivalentServiceName: "@tw-cloud/sc/firestoreToMongo",
        filePath: "filepath",
      },
    ];
    AnalysisReportUtils.read = jest.fn().mockReturnValue(mockReport);

    new Translator().run();

    expect(mockFS.writeFileSync).toBeCalledWith("filepath", expectWriteValue, "utf-8");
  });
});
