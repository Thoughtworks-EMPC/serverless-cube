import * as path from "path";
import { LockingServiceAnalyzer, LockingServiceAnalyzerCollection } from "../../src/scan";

describe("LockingServiceAnalyzer", () => {
  it("should return a report when matches a locking service", () => {
    const filePath = path.join(__dirname, "files/dummyFile.js");
    const lockingServiceAnalyzer = new LockingServiceAnalyzer(
      "@google-cloud/firestore",
      "@tw-cloud/sc/adaptors/firestore/mongodb",
      "@google-cloud/firestore"
    );

    const analyzeReport = lockingServiceAnalyzer.analyze(filePath);

    const expectReport = {
      gcpServiceNameMatcher: "@google-cloud/firestore",
      aliEquivalentServiceName: "@tw-cloud/sc/adaptors/firestore/mongodb",
      filePath,
    };
    expect(analyzeReport).toEqual(expectReport);
  });

  it("should return undefined when does not match a locking service", () => {
    const filePath = path.join(__dirname, "files/dummyFile_no_match.js");
    const lockingServiceAnalyzer = new LockingServiceAnalyzer(
      "@google-cloud/firestore",
      "@tw-cloud/sc/firestoreToMongo",
      "@google-cloud/firestore"
    );

    const analyzeReport = lockingServiceAnalyzer.analyze(filePath);

    expect(analyzeReport).toBe(undefined);
  });
});

describe("LockingServiceAnalyzerCollection", () => {
  it("should return all reports when matches multiple locking service", () => {
    const filePath = path.join(__dirname, "files/dummyFile.js");

    const analyzeReports = LockingServiceAnalyzerCollection.analyzeAll(filePath);

    const expectReports = [
      {
        gcpServiceNameMatcher: "@google-cloud/firestore",
        aliEquivalentServiceName: "@tw-cloud/sc/adaptors/firestore/mongodb",
        filePath,
      },
      {
        gcpServiceNameMatcher: "@google-cloud/logging",
        aliEquivalentServiceName: "@tw-cloud/sc/logging",
        filePath,
      },
    ];
    expect(analyzeReports).toEqual(expectReports);
  });

  it("should return empty report when does not match any locking service", () => {
    const filePath = path.join(__dirname, "files/dummyFile_no_match.js");

    const analyzeReports = LockingServiceAnalyzerCollection.analyzeAll(filePath);

    expect(analyzeReports.length).toBe(0);
  });

  it("should filter excluded locking service when analyzes file", () => {
    const filePath = path.join(__dirname, "files/dummyFile.js");
    const excludeLockingService = ["@google-cloud/firestore"];

    const analyzeReports = LockingServiceAnalyzerCollection.analyzeAll(
      filePath,
      excludeLockingService
    );

    const expectReports = [
      {
        gcpServiceNameMatcher: "@google-cloud/logging",
        aliEquivalentServiceName: "@tw-cloud/sc/logging",
        filePath,
      },
    ];
    expect(analyzeReports).toEqual(expectReports);
  });
});
