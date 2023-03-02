import Scan from "../../src/scan";

describe("Command Scan", () => {
  beforeAll(() => {
    Scan.prototype.run = jest.fn();
  });

  it("should run with correct params", () => {
    process.argv = [
      "-p",
      "package-dir",
      "-e",
      "exclude-service-01",
      "exclude-service-02",
      "-o",
      "output",
      "-v",
      "verbose",
    ];
    const expectedParameter = {
      packagesDir: "package-dir",
      excludeLockingService: ["exclude-service-01", "exclude-service-02"],
      output: "output",
      verbose: "verbose",
    };

    require("../../src/command/scan");

    expect(Scan.prototype.run).toBeCalledWith(expectedParameter);
  });
});