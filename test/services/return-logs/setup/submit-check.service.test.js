'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../../../app/models/return-requirement.model.js')
const ReturnSubmissionLineHelper = require('../../../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionLineModel = require('../../../../app/models/return-submission-line.model.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../../../app/models/return-version.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/return-logs/setup/submit-check.service.js')

describe('Return Logs Setup - Submit Check service', () => {
  let licence
  let returnLog
  let returnVersion
  let returnRequirement
  let session
  let sessionData
  let user

  beforeEach(async () => {
    user = await UserHelper.add()

    licence = await LicenceHelper.add()

    returnLog = await ReturnLogHelper.add({
      licenceRef: licence.licenceRef,
      status: 'due'
    })

    returnVersion = await ReturnVersionHelper.add({
      licenceId: licence.id,
      status: 'current',
      version: 1
    })

    returnRequirement = await ReturnRequirementHelper.add({
      returnVersionId: returnVersion.id,
      returnsFrequency: 'month',
      siteDescription: 'Test Site'
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

    session = await SessionHelper.add(sessionData)
  })

  describe('when called with valid data', () => {
    it('creates a new return version', async () => {
      const result = await SubmitCheckService.go(session.id, user)

      expect(result.returnLogId).to.equal(returnLog.id)

      const returnVersion = await ReturnVersionModel.query().where('id', result.returnVersionId).first()

      expect(returnVersion).to.exist()
      expect(returnVersion.status).to.equal('current')
      expect(returnVersion.createdBy).to.equal(user.id)
    })

    it('marks previous versions as superseded', async () => {
      await ReturnVersionHelper.add({
        licenceId: licence.id,
        status: 'current',
        version: 1
      })

      await SubmitCheckService.go(session.id, user)

      const previousVersion = await ReturnVersionModel.query()
        .where('licenceId', licence.id)
        .where('version', 1)
        .first()

      expect(previousVersion.status).to.equal('superseded')
    })

    it('updates the return log status', async () => {
      await SubmitCheckService.go(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)

      expect(updatedReturnLog.status).to.equal('submitted')
    })

    it('deletes the session', async () => {
      await SubmitCheckService.go(session.id, user)

      const deletedSession = await ReturnLogModel.query().findById(session.id)

      expect(deletedSession).to.not.exist()
    })

    it('creates return submission lines', async () => {
      const result = await SubmitCheckService.go(session.id, user)

      const submissionLines = await ReturnSubmissionLineModel.query().where(
        'returnSubmissionId',
        result.returnVersionId
      )

      expect(submissionLines).to.have.length(2)

      expect(submissionLines[0].quantity).to.equal(100)
      expect(submissionLines[0].startDate.toISOString().split('T')[0]).to.equal('2023-01-01')
      expect(submissionLines[0].endDate.toISOString().split('T')[0]).to.equal('2023-01-31')

      expect(submissionLines[1].quantity).to.equal(200)
      expect(submissionLines[1].startDate.toISOString().split('T')[0]).to.equal('2023-02-01')
      expect(submissionLines[1].endDate.toISOString().split('T')[0]).to.equal('2023-02-28')
    })

    it('creates new return requirements based on existing ones', async () => {
      const result = await SubmitCheckService.go(session.id, user)

      const [newRequirement] = await ReturnRequirementModel.query().where('returnVersionId', result.returnVersionId)

      expect(newRequirement.returnsFrequency).to.equal(returnRequirement.returnsFrequency)
      expect(newRequirement.siteDescription).to.equal(returnRequirement.siteDescription)
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
