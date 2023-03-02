#!/usr/bin/env node

import Translator from "../translate";

export default function run() {
  new Translator().run();
}

run();