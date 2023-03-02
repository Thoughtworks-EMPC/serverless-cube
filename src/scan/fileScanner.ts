import * as fs from "fs";
import * as path from "path";
import { AnalysisReport } from "./lockingServiceAnalyzer";
import { LockingServiceAnalyzerCollection } from "./lockingServiceAnalyzerCollection";

export class FileScanner {
  static scan(
    directory: string,
    excludeLockingService?: string[],
    analysisReports: AnalysisReport[] = []
  ): AnalysisReport[] {
    if (directory.includes("node_modules")) {
      return [];
    }

    fs.readdirSync(directory).forEach((file) => {
      const filePath = path.join(directory, file);

      if (fs.statSync(filePath).isDirectory()) {
        this.scan(filePath, excludeLockingService, analysisReports);
      } else if (this.isExtNameMatch(filePath)) {
        analysisReports.push(
          ...LockingServiceAnalyzerCollection.analyzeAll(filePath, excludeLockingService)
        );
      }
    });

    return analysisReports;
  }

  private static isExtNameMatch(filePath: string): boolean {
    return [".coffee", ".js", ".jsx", ".ts", ".tsx", ".mjs"].includes(
      path.extname(filePath)
    );
  }
}
