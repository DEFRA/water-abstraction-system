'use strict'

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/app/**/*.js',
    '**/config/**/*.js',
    '**/index.js'
  ],
  coverageDirectory: './coverage',
  coverageReporters: [
    'lcov',
    ['text', { skipFull: true }]
  ],
  globalSetup: './test/support/jest.setup.js',
  testEnvironment: 'node',
  // The glob patterns Jest uses to detect test files
  testMatch: [

    '**/test/controllers/*.test.js',
    '**/test/errors/*.test.js',
    '**/test/models/**/*.test.js',
    '**/test/plugins/**/*.test.js'
  ],
  verbose: true
}
