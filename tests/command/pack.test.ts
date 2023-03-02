import Pack from "../../src/pack";

describe("Command Pack", () => {
  beforeAll(() => {
    Pack.prototype.run = jest.fn();
  });

  it("should run with correct params", () => {
    process.argv = [
      "-p",
      "cloud-run",
      "--fp",
      "fake-path",
      "-r",
      "fake-registry-uri",
      "-a",
      "fake-app-name",
      "--fn",
      "fake-function-name",
      "-d",
      "fake-dockerfile-path",
    ];
    const expectedParameter = {
      platform: "cloud-run",
      functionPath: "fake-path",
      registryUri: "fake-registry-uri",
      appName: "fake-app-name",
      functionName: "fake-function-name",
      dockerfilePath: "fake-dockerfile-path",
    };

    require("../../src/command/pack");

    expect(Pack.prototype.run).toBeCalledWith(expectedParameter);
  });
});
