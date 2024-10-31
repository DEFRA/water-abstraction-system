'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it } = require('node:test')
const { expect } = Code

// Thing under test
const DatabaseHealthCheckService = require('../../../app/services/health/database-health-check.service.js')

describe('Database Health Check service', () => {
  it('confirms connection to the db by not throwing an error', async () => {
    await expect(DatabaseHealthCheckService.go()).to.not.reject()
  })
})
