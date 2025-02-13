'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Thing under test
const VoidNoReturnRequiredLicenceReturnLogsService = require('../../../app/services/return-logs/void-no-return-required-licence-return-logs.service.js')

describe('Return Logs - Void No Return Required Licence Return Logs service', () => {
  let licence
  let returnVersion
  let returnLogMatchingVersion
  let returnLogNotMatchingVersion
  let returnLogBeingChecked

  describe('when provided a licence version id that has an end date', () => {
    before(async () => {
      licence = await LicenceHelper.add()
      returnVersion = await ReturnVersionHelper.add({
        licenceId: licence.id,
        endDate: new Date('2023-03-31'),
        startDate: new Date('2022-04-01')
      })
      returnLogMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2023-03-31'),
        licenceRef: licence.licenceRef,
        startDate: new Date('2022-04-01')
      })
      returnLogNotMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2024-03-31'),
        licenceRef: licence.licenceRef,
        startDate: new Date('2023-04-01')
      })
    })

    it('voids the return logs that are between the start and end dates of the no return required version', async () => {
      await VoidNoReturnRequiredLicenceReturnLogsService.go(
        licence.licenceRef,
        returnVersion.startDate,
        returnVersion.endDate
      )

      returnLogBeingChecked = await returnLogMatchingVersion.$query()
      expect(returnLogBeingChecked.status).to.equal('void')

      returnLogBeingChecked = await returnLogNotMatchingVersion.$query()
      expect(returnLogBeingChecked.status).to.equal('due')
    })
  })

  describe('when provided a licence version id with no end date', () => {
    before(async () => {
      licence = await LicenceHelper.add()
      returnVersion = await ReturnVersionHelper.add({ licenceId: licence.id })
      returnLogBeingChecked = await ReturnLogHelper.add({
        endDate: new Date('2023-03-31'),
        licenceRef: licence.licenceRef,
        startDate: new Date('2022-04-01')
      })
      returnLogNotMatchingVersion = await ReturnLogHelper.add({
        endDate: new Date('2024-03-31'),
        licenceRef: licence.licenceRef,
        startDate: new Date('2023-04-01')
      })
    })

    it('voids the return logs that are from the start date of the return version forward', async () => {
      await VoidNoReturnRequiredLicenceReturnLogsService.go(licence.licenceRef, returnVersion.startDate)

      returnLogBeingChecked = await returnLogMatchingVersion.$query()
      expect(returnLogBeingChecked.status).to.equal('void')

      returnLogBeingChecked = await returnLogNotMatchingVersion.$query()
      expect(returnLogBeingChecked.status).to.equal('void')
    })
  })
})
