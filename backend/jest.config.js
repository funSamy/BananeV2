module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/generated/prisma/(.*)$': '<rootDir>/../prisma/generated/prisma/$1',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(@prisma/client|@prisma/adapter-better-sqlite3))/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'tsx', 'json', 'node'],
  testMatch: ['**/*.spec.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  setupFiles: ['./test/setup.ts'],
};
