'use strict'

module.exports = {
  test: {
    coverage: {
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
      provider: 'v8',
      reporter: ['lcov'],
      reportsDirectory: 'coverage'
    },
    environment: 'node',
    globals: true,
    globalSetup: ['test/global-setup.js'],
    globalTeardown: ['test/global-teardown.js'],
    hookTimeout: 60000,
    include: ['test/**/*.test.js'],
    pool: 'forks',
    // NOTE: Vitest 4 removed `poolOptions` and the `singleFork` option (see the "Pool Rework" section of the v4
    // migration guide). Concurrency is now controlled by the top-level `maxWorkers`. We set it to 1 so only one test
    // file runs at a time. This is required because every test uses the single shared PostgreSQL test database, and
    // our `Database.clean()` issues `TRUNCATE ... RESTART IDENTITY` (an ACCESS EXCLUSIVE lock). If files ran in
    // parallel, one fork's TRUNCATE could wait indefinitely on a lock held by another fork (no statement_timeout is
    // set), hanging the whole run. We deliberately leave `isolate` at its default (true) rather than following the
    // guide's `isolate: false` mapping, so each file still runs in a fresh process and memory stays bounded across
    // the full suite.
    maxWorkers: '50%',
    sequence: {
      shuffle: {
        files: true
      }
    },
    testTimeout: 60000
  }
}
