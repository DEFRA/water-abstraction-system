'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnSubmissionLineHelper = require('../../../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionLineModel = require('../../../../app/models/return-submission-line.model.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../../../app/models/return-version.model.js')

// Thing under test
const CreateNewReturnVersionService = require('../../../../app/services/return-logs/setup/create-new-return-version.service.js')

describe('Return Logs Setup - Create New Return Version service', () => {
  let licence
  let returnLog
  let sessionData

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    returnLog = await ReturnLogHelper.add({
      licenceRef: licence.licenceRef,
      status: 'due'
    })

    await ReturnVersionHelper.add({
      licenceId: licence.id,
      status: 'current',
      version: 1
    })

    sessionData = {
      data: {
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        returnReference: returnLog.returnReference,
        returnLogId: returnLog.id,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        lines: [
          _createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
            startDate: '2023-01-01',
            endDate: '2023-01-31',
            quantity: 100
          }),
          _createInstance(ReturnSubmissionLineModel, ReturnSubmissionLineHelper, {
            startDate: '2023-02-01',
            endDate: '2023-02-28',
            quantity: 200
          })
        ]
      }
    }
  })

  describe('when called with valid data', () => {
    it('creates a new return version', async () => {
      const result = await CreateNewReturnVersionService.go(sessionData)

      expect(result.version).to.equal(2)
      expect(result.status).to.equal('current')
    })

    it('marks previous versions as superseded', async () => {
      await CreateNewReturnVersionService.go(sessionData)

      const previousVersion = await ReturnVersionModel.query()
        .where('licenceId', licence.id)
        .where('version', 1)
        .first()

      expect(previousVersion.status).to.equal('superseded')
    })
  })
})

// Create an instance of a given model using the defaults of the given helper, without creating it in the db. This
// allows us to pass in the expected models without having to touch the db at all.
function _createInstance(model, helper, data = {}) {
  return model.fromJson({
    createdAt: new Date(),
    updatedAt: new Date(),
    ...helper.defaults(),
    ...data
  })
}
