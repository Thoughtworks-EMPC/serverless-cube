import * as fs from "fs";
import * as path from "path";
import { AnalysisReport } from "./lockingServiceAnalyzer";

export class AnalysisReportUtils {
  private static configFilePath = "./.fsa/.translate-map.json";

  static setConfigFilePath(configFilePath: string) {
    this.configFilePath = configFilePath;
  }

  static write(reports: AnalysisReport[]) {
    if (!fs.existsSync(this.configFilePath)) {
      fs.mkdirSync(path.dirname(this.configFilePath));
    }
    fs.writeFileSync(this.configFilePath, JSON.stringify(reports, null, 4), "utf8");
  }

  static read(): AnalysisReport[] {
    try {
      return JSON.parse(fs.readFileSync(this.configFilePath, "utf-8"));
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}
