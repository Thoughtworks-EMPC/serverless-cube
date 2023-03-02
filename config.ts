import 'jest-ts-auto-mock';
import logger from "./src/logger";

// disble winston when running tests
logger.silent = true