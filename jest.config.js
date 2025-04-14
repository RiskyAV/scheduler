/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],
  rootDir: './',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 2,
      functions: 2,
      lines: 2,
      statements: 2,
    },
  },
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
  ],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { isolatedModules: true }],
  },
  collectCoverageFrom: [
    '**/*.ts',
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '.*\\.module.ts',
    '.*\\.dto.ts',
    '.*constants.ts',
    '.*constant.ts',
    '.*\\.validator.ts',
    '.*\\.handler.ts',
    '.*\\.command.ts',
    'main.ts',
    '/src/configs',
    '/src/providers',
    '/src/*/dto',
    '/dist/*',
    '/database/*',
    '/configs/*',
  ],
  moduleNameMapper: {
    '^@app/logger(|/.*)$': '<rootDir>/libs/logger/src/$1',
  },
};

module.exports = config;
