import shelljs from "shelljs";

export type PackParameters = {
  platform: string;
  functionPath?: string;
  registryUri?: string;
  appName?: string;
  functionName?: string;
  dockerfilePath?: string;
};

export default class Pack {
  PLATFORM_CLOUD_FUNCTION = "cloud-function";
  PLATFORM_CLOUD_RUN = "cloud-run";

  run(params: PackParameters) {
    if (params.platform === this.PLATFORM_CLOUD_FUNCTION) {
      shelljs.exec(`
      (curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.27.0/pack-v0.27.0-linux.tgz" | sudo tar -C /usr/local/bin/ --no-same-owner -xzv pack)
      pack build ${params.registryUri}/${params.appName}  \
                      --builder 'gcr.io/buildpacks/builder:v1' \
                      --path ${params.functionName} \
                      --env GOOGLE_FUNCTION_SIGNATURE_TYPE=http \
                      --env GOOGLE_FUNCTION_TARGET=${params.functionName}`);
    } else if (params.platform === this.PLATFORM_CLOUD_RUN) {
      shelljs.exec(`docker build \
      -t ${params.registryUri}/${params.appName} \
      -f  ${params.dockerfilePath} .`);
    } else {
      shelljs.exec(`echo "Invalid source platform"`);
    }
  }
}
