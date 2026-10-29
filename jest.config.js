module.exports = {
  testEnvironment: 'node',
  transformIgnorePatterns: [
    // Tells Jest to transform ESM packages inside node_modules like @actions/core
    "node_modules/(?!(@actions)/)"
  ]
};