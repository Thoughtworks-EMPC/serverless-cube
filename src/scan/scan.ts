import { FileScanner } from "./fileScanner";
import { AnalysisReportUtils } from "./analysisReportUtils";

export type ScanParameters = {
  packagesDir: string;
  excludeLockingService?: string[];
  output?: string;
  verbose?: string;
};

export default class Scan {
  run({ packagesDir, excludeLockingService }: ScanParameters) {
    AnalysisReportUtils.write(FileScanner.scan(packagesDir, excludeLockingService));
  }
}
