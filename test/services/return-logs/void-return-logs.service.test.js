'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Thing under test
const VoidNoReturnRequiredLicenceReturnLogsService = require('../../../app/services/return-logs/void-return-logs.service.js')

describe('Return Logs - Void Return Logs service', () => {
  let licenceRef = 'return-logs'
  let returnLogMatchingVersion
  let returnLogNotMatchingVersion
  let returnLogBeingChecked

  describe('when provided a licence ref with an end date', () => {
    before(async () => {
      licenceRef = 'return-logs-end-date'
      returnLogMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2023-03-31'),
        licenceRef,
        startDate: new Date('2022-04-01')
      })
      returnLogNotMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2024-03-31'),
        licenceRef,
        startDate: new Date('2023-04-01')
      })
    })

    it('voids the return logs that are between the start and end dates', async () => {
      await VoidNoReturnRequiredLicenceReturnLogsService.go(licenceRef, new Date('2022-04-01'), new Date('2023-03-31'))

      returnLogBeingChecked = await returnLogMatchingVersion.$query()
      expect(returnLogBeingChecked.status).to.equal('void')

      returnLogBeingChecked = await returnLogNotMatchingVersion.$query()
      expect(returnLogBeingChecked.status).to.equal('due')
    })
  })

  describe('when provided a licence version id with no end date', () => {
    before(async () => {
      licenceRef = 'return-logs-no-end-date'
      returnLogBeingChecked = await ReturnLogHelper.add({
        endDate: new Date('2023-03-31'),
        licenceRef,
        startDate: new Date('2022-04-01')
      })
      returnLogNotMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2024-03-31'),
        licenceRef,
        startDate: new Date('2023-04-01')
      })
    })

    it('voids the return logs that are from the start date of the return version forward', async () => {
      await VoidNoReturnRequiredLicenceReturnLogsService.go(licenceRef, new Date('2022-04-01'))

      returnLogBeingChecked = await returnLogMatchingVersion.$query()
      expect(returnLogBeingChecked.status).to.equal('void')

      returnLogBeingChecked = await returnLogNotMatchingVersion.$query()
      expect(returnLogBeingChecked.status).to.equal('void')
    })
  })

  describe('when provided a licence ref with no return logs', () => {
    it('does nothing', async () => {
      returnLogBeingChecked = await VoidNoReturnRequiredLicenceReturnLogsService.go(
        'no-return-logs',
        new Date('2020-03-31')
      )

      returnLogBeingChecked = await ReturnLogModel.query().where('licenceRef', 'no-return-logs')
      expect(returnLogBeingChecked).to.equal([])
    })
  })
})
