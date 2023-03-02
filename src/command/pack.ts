#!/usr/bin/env node

import Pack from "../pack";
import yargs from "yargs";

export default function run() {
  const {
    platform,
    functionPath,
    registryUri,
    appName,
    functionName,
    dockerfilePath,
  }: any = yargs(process.argv).options({
    platform: {
      alias: "p",
      describe: "serverless platform",
      demandOption: true,
    },
    functionPath: {
      alias: "fp",
      describe: "cloud function path",
    },
    registryUri: {
      alias: "r",
      describe: "docker registry uri",
    },
    appName: {
      alias: "a",
      describe: "cloud function app name",
    },
    functionName: {
      alias: "fn",
      describe: "cloud function name",
    },
    dockerfilePath: {
      alias: "d",
      describe: "dockerfile path",
    },
  }).argv;

  new Pack().run({
    platform,
    functionPath,
    registryUri,
    appName,
    functionName,
    dockerfilePath,
  });
}

run();
