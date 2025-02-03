import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
    dir: './',
})
 
const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',

    testMatch: ['<rootDir>/__tests__/**/*.test.tsx'],

    moduleNameMapper: {
        '^@components/(.*)$': '<rootDir>/src/components/$1',
    },

    globals: {
        "ts-jest": {
          isolatedModules: true,
        },
    },
}
 
export default createJestConfig(config)

// reference: https://nextjs.org/docs/app/building-your-application/testing/jest