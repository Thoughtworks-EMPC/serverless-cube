#!/usr/bin/env node

import Scan from "../scan";
import yargs from "yargs";

export default function run() {
  const { packagesDir, excludeLockingService, output, verbose }: any = yargs(
    process.argv
  ).options({
    packagesDir: {
      alias: "p",
      describe: "set directory path for packages. defaults to current directory",
      default: ".",
    },
    excludeLockingService: {
      type: "array",
      alias: "e",
      describe: "exclude list of locking sercice",
    },
    output: {
      alias: "o",
      describe: "set file path for JSON output",
    },
    verbose: {
      alias: "v",
      descibe: "print more details for each package scan",
    },
  }).argv;

  new Scan().run({
    packagesDir,
    excludeLockingService,
    output,
    verbose,
  });
}

run();
