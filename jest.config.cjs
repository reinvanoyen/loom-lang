/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    moduleNameMapper: {
        '^chalk$': '<rootDir>/__mocks__/chalk.js',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};
