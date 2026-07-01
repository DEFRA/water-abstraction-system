'use strict'

const ci = String(process.env.CI) === 'true' || false

const vitestConfig = {
  test: {
    cache: !ci,
    coverage: {
      // Only measure coverage for files changed since the last commit; in CI all files are always included
      changed: !ci,
      // Files and folders to exclude from coverage measurement entirely
      exclude: [
        'app/controllers/check.controller.js',
        'app/plugins/airbrake.plugin.js',
        'app/plugins/auth.plugin.js',
        'app/plugins/hapi-pino.plugin.js',
        'app/plugins/stop.plugin.js',
        'app/plugins/views.plugin.js',
        'config/**',
        'db/seeds/**',
        'templates/**',
        'test/**'
      ],
      // Use V8's built-in coverage instrumentation
      provider: 'v8',
      // In CI emit an lcov report for upload to SonarQube; locally print a text summary to the terminal
      reporter: ci ? ['lcov'] : ['text'],
      // Directory where lcov coverage reports are written
      reportsDirectory: 'coverage'
    },
    // Base directory to scan for test files. Specified to speed up test discovery
    dir: 'test',
    // Module(s) to run once before all test suites. We use it to clean and seed the database
    globalSetup: ['test/global-setup.js'],
    // Each entry is a separate Vitest project, allowing different runner settings per group of tests
    projects: [
      {
        // Tests with either no database interaction or the interaction is safe — can be run in parallel.
        // Move a folder here once all tests in it are free of state pollution in the DB
        test: {
          // Run tests in a plain Node.js environment with no browser globals
          environment: 'node',
          // Inject Vitest globals (describe, it, expect, etc.) without requiring explicit imports in test files
          globals: true,
          // Maximum time in milliseconds allowed for a before/after hook to complete
          hookTimeout: 10000,
          // Glob patterns that select which test files belong to this project
          include: [
            'test/controllers/**/*.test.js',
            'test/errors/**/*.test.js',
            'test/lib/**/*.test.js',
            'test/models/**/*.test.js',
            'test/plugins/**/*.test.js',
            'test/presenters/**/*.test.js',
            'test/requests/**/*.test.js',
            'test/services/address/**/*.test.js',
            'test/services/companies/**/*.test.js',
            'test/services/company-contacts/**/*.test.js',
            'test/services/data/**/*.test.js',
            'test/services/health/**/*.test.js',
            'test/services/licence-versions/**/*.test.js',
            'test/services/manage/**/*.test.js',
            'test/services/monitoring-stations/**/*.test.js',
            'test/services/plugins/**/*.test.js',
            'test/validators/**/*.test.js',
            'test/views/**/*.test.js',
            'test/services/users/**/*.test.js'
          ],
          // Share a single worker context across test files rather than isolating each file in its own module scope
          isolate: false,
          // Human-readable label for this project shown in the Vitest output
          name: 'parallel',
          // In CI use 2 workers (GitHub actions have 2 cores) to avoid resource contention; locally use 50%
          maxWorkers: ci ? 2 : '50%',
          // In CI use forked processes for safety; locally use threads for faster startup
          pool: ci ? 'forks' : 'threads',
          sequence: {
            // Run this project before the 'series' project (lower number runs first)
            groupOrder: 0,
            shuffle: {
              // Randomise the order test files are run to surface hidden ordering dependencies
              files: true
            }
          },
          // Maximum time in milliseconds a single test is allowed to run before it is marked as timed out
          testTimeout: 10000,
          // Disable watch mode so the suite always runs to completion and exits
          watch: false
        }
      },
      {
        // Any folder that contains at least one test that is affected by state pollution in the DB, for example, it
        // asserts a result is `equalTo()` yet the it may contain data from other tests.
        // Migrate a folder to the 'unit' project above once every test in it is free of direct DB interaction.
        test: {
          // Run tests in a plain Node.js environment with no browser globals
          environment: 'node',
          // Inject Vitest globals (describe, it, expect, etc.) without requiring explicit imports in test files
          globals: true,
          // Maximum time in milliseconds allowed for a before/after hook to complete
          hookTimeout: 10000,
          // Glob patterns that select which test files belong to this project
          include: [
            'test/dal/**/*.test.js',
            'test/services/bill-licences/**/*.test.js',
            'test/services/bill-runs/**/*.test.js',
            'test/services/billing-accounts/**/*.test.js',
            'test/services/bills/**/*.test.js',
            'test/services/idm/**/*.test.js',
            'test/services/jobs/**/*.test.js',
            'test/services/licence-monitoring-station/**/*.test.js',
            'test/services/licences/**/*.test.js',
            'test/services/notices/**/*.test.js',
            'test/services/notifications/**/*.test.js',
            'test/services/reports/**/*.test.js',
            'test/services/return-logs/**/*.test.js',
            'test/services/return-submissions/**/*.test.js',
            'test/services/return-versions/**/*.test.js',
            'test/services/search/**/*.test.js'
          ],
          // Human-readable label for this project shown in the Vitest output
          name: 'series',
          // Force a single worker so tests run one at a time and cannot interfere with each other via the database
          maxWorkers: 1,
          // Use forked processes to ensure each worker has a clean process boundary
          pool: 'forks',
          sequence: {
            // Run this project after the 'parallel' project (higher number runs later)
            groupOrder: 1,
            shuffle: {
              // Randomise the order test files are run to surface hidden ordering dependencies
              files: true
            }
          },
          // Maximum time in milliseconds a single test is allowed to run before it is marked as timed out
          testTimeout: 10000,
          // Disable watch mode so the suite always runs to completion and exits
          watch: false
        }
      }
    ]
  }
}

module.exports = {
  ...vitestConfig
}
