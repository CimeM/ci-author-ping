module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@actions/core$': '<rootDir>/node_modules/@actions/core/lib/core.js',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@actions)/)"
  ],
};
