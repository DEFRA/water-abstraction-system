'use strict'

module.exports = {
  test: {
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
