import * as fs from "fs";
import { AnalysisReportUtils } from "../scan";

export default class Translator {
  run() {
    AnalysisReportUtils.read().forEach(
      ({ gcpServiceNameMatcher, aliEquivalentServiceName, filePath }) => {
        const replacedContent = fs
          .readFileSync(filePath, "utf-8")
          .replace(new RegExp(gcpServiceNameMatcher, "gm"), aliEquivalentServiceName);
        fs.writeFileSync(filePath, replacedContent, "utf-8");
      }
    );
  }
}
