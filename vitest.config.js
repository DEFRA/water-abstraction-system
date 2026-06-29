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
    setupFiles: ['test/setup.js'],
    include: ['test/**/*.test.js'],
    forks: {
      singleFork: true
    },
    pool: 'forks',
    sequence: {
      shuffle: {
        files: true
      }
    },
    testTimeout: 60000
  }
}
