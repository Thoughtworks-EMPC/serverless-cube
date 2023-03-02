const fs = require("fs");
const shelljs = require("shelljs");

const dirs = ["adaptors", "command", "pack", "scan", "translate", "logger"];

function rmDirs() {
  dirs.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.rm(file, { recursive: true }, () => {});
    }
  });
}

const publish = () => {
  rmDirs();
  try {
    shelljs.exec("npm version patch");
    shelljs.exec("tsc");
    shelljs.exec("npm publish");
  } finally {
    rmDirs();
  }
};

publish();
