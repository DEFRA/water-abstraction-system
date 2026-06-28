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
    hookTimeout: 60000,
    include: ['test/**/*.test.js'],
    pool: 'forks',
    forks: {
      singleFork: true
    },
    testTimeout: 60000
  }
}
