module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ".(ts|tsx)": "ts-jest",
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        compiler: "ttypescript",
      },
    ],
  },
  testMatch: ["**/tests/**/*.test.(ts|js)"],
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  clearMocks: true,
  restoreMocks: true,
  setupFiles: ["<rootDir>config.ts"],
};
