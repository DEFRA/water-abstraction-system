'use strict'

// Test framework dependencies
const { describe, it, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../support/database.js')

// Thing under test
const DatabaseHealthCheckService = require('../../../app/services/health/database-health-check.service.js')

describe('Database Health Check service', () => {
  after(async () => {
    await closeConnection()
  })

  it('confirms connection to the db by not throwing an error', async () => {
    await expect(DatabaseHealthCheckService.go()).to.not.reject()
  })
})
