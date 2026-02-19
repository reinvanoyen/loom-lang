/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    moduleNameMapper: {
        '^chalk$': '<rootDir>/test/mocks/chalk.js',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};
