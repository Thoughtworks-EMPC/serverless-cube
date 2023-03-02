import * as fs from "fs";

export type AnalysisReport = {
  gcpServiceNameMatcher: string;
  aliEquivalentServiceName: string;
  filePath: string;
};

export class LockingServiceAnalyzer {
  gcpServiceName: string;
  aliEquivalentServiceName: string;
  matcher: RegExp;
  originMatcher: string;

  constructor(
    gcpServiceName: string,
    aliEquivalentServiceName: string,
    matcher: string | undefined
  ) {
    this.gcpServiceName = gcpServiceName;
    this.aliEquivalentServiceName = aliEquivalentServiceName;

    if (matcher) {
      this.originMatcher = matcher;
      this.matcher = new RegExp(matcher, "gm");
    } else {
      this.originMatcher = this.gcpServiceName;
      this.matcher = new RegExp(this.gcpServiceName, "gm");
    }
  }

  analyze(filePath: string): AnalysisReport | undefined {
    if (fs.readFileSync(filePath, "utf8").match(this.matcher)) {
      return {
        gcpServiceNameMatcher: this.originMatcher,
        aliEquivalentServiceName: this.aliEquivalentServiceName,
        filePath,
      };
    }
  }
}
