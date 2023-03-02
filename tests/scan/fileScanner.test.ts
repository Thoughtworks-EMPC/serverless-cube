import * as path from "path";
import { LockingServiceAnalyzerCollection, AnalysisReport, FileScanner } from "../../src/scan";

describe("FileScanner", () => {
  it("should analyze files that match rules", () => {
    const mockReport: AnalysisReport[] = [
      {
        gcpServiceNameMatcher: "@google-cloud/firestore",
        aliEquivalentServiceName: "@tw-cloud/sc/firestoreToMongo",
        filePath: "tests/scan/files/dummyDir/dummyFile.js",
      },
      {
        gcpServiceNameMatcher: "@google-cloud/firestore",
        aliEquivalentServiceName: "@tw-cloud/sc/firestoreToMongo",
        filePath: "tests/scan/files/dummyDir/dummyFile.js",
      },
    ];
    LockingServiceAnalyzerCollection.analyzeAll = jest.fn().mockReturnValue(mockReport);

    const result = FileScanner.scan(path.join(__dirname, "files"));

    expect(result.length).toBe(6);
  });
});
