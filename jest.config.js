export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.ts?(x)'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@db/(.*)$': '<rootDir>/db/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      useESM: true
    }
  }
}
