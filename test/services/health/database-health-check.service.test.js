'use strict'

// Thing under test
const DatabaseHealthCheckService = require('../../../app/services/health/database-health-check.service.js')

describe('Database Health Check service', () => {
  it('confirms connection to the db by not throwing an error', async () => {
    await expect(DatabaseHealthCheckService.go()).resolves.toBeDefined()
  })
})
