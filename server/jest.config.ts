import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    roots: ["<rootDir>/src/"],
    transform: {"^.+\\.tsx?$": "ts-jest"},
    moduleNameMapper: {
      "@/(.*)": "<rootDir>/src/$1"
    }
};

export default config;

