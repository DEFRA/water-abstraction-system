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
    '**/test/plugins/**/*.test.js',
    '**/test/lib/**/base-notifier.lib.test.js',
    '**/test/lib/**/boom-notifier.lib.test.js',
    '**/test/lib/**/charging-module-request.lib.test.js',
    '**/test/lib/**/general.lib.test.js',
    '**/test/lib/**/global-notifier.lib.test.js',
    '**/test/lib/**/legacy-db-snake-case-mappers.lib.test.js',
    '**/test/lib/**/legacy-request.lib.test.js',
    '**/test/lib/**/request-notifier.lib.test.js',
    '**/test/lib/**/general.lib.test.js',
    '**/test/presenters/**/*.test.js',
    '**/test/services/plugins/**/*test.js'
  ],
  verbose: true
}
