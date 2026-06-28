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
        'config/notify.config.js',
        'db/seeds/**',
        'templates/**'
      ],
      provider: 'v8',
      reporter: ['lcov'],
      reportsDirectory: 'coverage'
    },
    environment: 'node',
    globals: true,
    include: ['test/**/*.test.js'],
    hookTimeout: 60000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    testTimeout: 60000
  }
}
