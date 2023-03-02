import Pack from "../../src/pack";
import shelljs from "shelljs";

jest.mock("shelljs", () => {
  return { exec: jest.fn() };
})

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Pack", () => {
  const fakePackParameters = {
    platform: "cloud-function",
    functionPath: "fake-path",
    registryUri: "fake-registry-uri",
    appName: "fake-app-name",
    functionName: "fake-function-name",
    dockerfilePath: "fake-dockerfile-path",
  };

  it("should excute the pack when given cloud funtion", () => {
    new Pack().run(fakePackParameters);
    
    const params = `
      (curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.27.0/pack-v0.27.0-linux.tgz" | sudo tar -C /usr/local/bin/ --no-same-owner -xzv pack)
      pack build ${fakePackParameters.registryUri}/${fakePackParameters.appName}  \
                      --builder 'gcr.io/buildpacks/builder:v1' \
                      --path ${fakePackParameters.functionName} \
                      --env GOOGLE_FUNCTION_SIGNATURE_TYPE=http \
                      --env GOOGLE_FUNCTION_TARGET=${fakePackParameters.functionName}`;

    expect(shelljs.exec).toBeCalledWith(params);
  });

  it("should excute the docker build when given cloud run", () => {
    fakePackParameters.platform = "cloud-run";
    
    new Pack().run(fakePackParameters);
    const params = `docker build \
      -t ${fakePackParameters.registryUri}/${fakePackParameters.appName} \
      -f  ${fakePackParameters.dockerfilePath} .`;

    expect(shelljs.exec).toBeCalledWith(params);
  });

  it("Should return invalid source platform when receive invalid platform", () => {
    fakePackParameters.platform = "invalid-platform";
    
    new Pack().run(fakePackParameters);
    const params = `echo "Invalid source platform"`;

    expect(shelljs.exec).toBeCalledWith(params);
  });

});
