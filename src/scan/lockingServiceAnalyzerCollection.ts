import analyzersJson from "./analyzers.json";
import { LockingServiceAnalyzer } from "./lockingServiceAnalyzer";
import { AnalysisReport } from "./lockingServiceAnalyzer";

export class LockingServiceAnalyzerCollection {
  private static allAnalyzers: LockingServiceAnalyzer[] = this.init();

  private static init() {
    const allAnalyzers: LockingServiceAnalyzer[] = [];
    analyzersJson.forEach(({ gcpServiceName, aliEquivalentServiceName, matcher }) => {
      allAnalyzers.push(
        new LockingServiceAnalyzer(gcpServiceName, aliEquivalentServiceName, matcher)
      );
    });
    return allAnalyzers;
  }

  static getAllAnalyzers(): LockingServiceAnalyzer[] {
    return this.allAnalyzers;
  }

  static analyzeAll(
    filePath: string,
    excludeLockingService?: string[]
  ): AnalysisReport[] {
    const allReports: AnalysisReport[] = [];
    this.getAllAnalyzers()
      .filter(
        (analyzer) =>
          !excludeLockingService ||
          !excludeLockingService.includes(analyzer.gcpServiceName)
      )
      .forEach((analyzer) => {
        const report = analyzer.analyze(filePath);
        if (report) {
          allReports.push(report);
        }
      });
    return allReports;
  }
}
