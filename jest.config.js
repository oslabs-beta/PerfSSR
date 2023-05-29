module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    testMatch: ['**/__tests__/*.test.js'],
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    moduleNameMapper: {
      '\\.(css|scss)$': '<rootDir>/testing-files/style.mock.js',
    },
  };
  