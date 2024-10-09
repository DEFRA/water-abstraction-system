'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const VoidReturnLogsService = require('../../../../app/services/jobs/return-logs/void-return-logs.service.js')

describe('Void return log service', () => {
  const endDate = new Date('2022-05-01').toISOString().split('T')[0]
  const licenceReference = 'testReference'

  before(async () => {
    await ReturnLogHelper.add({ licenceRef: licenceReference })
    await ReturnLogHelper.add({ licenceRef: licenceReference })
  })

  describe('when provided a licence ref and a date', () => {
    it('should change the status of the return logs to void', async () => {
      await VoidReturnLogsService.go(licenceReference, endDate)
      const result = await ReturnLogModel.query().where('licenceRef', licenceReference)

      expect(result.length).to.equal(2)
      expect(result[0].status).to.equal('void')
      expect(result[1].status).to.equal('void')
    })
  })
})
