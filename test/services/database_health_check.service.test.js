// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'

// Thing under test
import DatabaseHealthCheckService from '../../app/services/database_health_check.service.js'

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

describe('Database Health Check service', () => {
  it('confirms connection to the db by not throwing an error', async () => {
    await expect(DatabaseHealthCheckService.go()).to.not.reject()
  })
})
