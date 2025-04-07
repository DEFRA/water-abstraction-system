'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const PointHelper = require('../../../support/helpers/point.helper.js')
const PurposeHelper = require('../../../support/helpers/purpose.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnRequirementHelper = require('../../../support/helpers/return-requirement.helper.js')
const ReturnRequirementModel = require('../../../../app/models/return-requirement.model.js')
const ReturnRequirementPointHelper = require('../../../support/helpers/return-requirement-point.helper.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const ReturnSubmissionLineHelper = require('../../../support/helpers/return-submission-line.helper.js')
const ReturnSubmissionLineModel = require('../../../../app/models/return-submission-line.model.js')
const ReturnVersionHelper = require('../../../support/helpers/return-version.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/return-logs/setup/submit-check.service.js')

// TODO: Properly stub dependencies

describe('Return Logs Setup - Submit Check service', () => {
  let licence
  let returnLog
  let returnVersion
  let returnRequirement
  let returnSubmission
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

    returnSubmission = await ReturnSubmissionHelper.add({
      returnLogId: returnLog.id
    })

    returnVersion = await ReturnVersionHelper.add({
      licenceId: licence.id,
      status: 'current',
      version: 1
    })

    const returnRequirementLegacyId = _generateIdNumber()
    returnRequirement = await ReturnRequirementHelper.add({
      returnVersionId: returnVersion.id,
      returnsFrequency: 'month',
      siteDescription: 'Test Site',
      legacyId: returnRequirementLegacyId
    })

    const pointExternalId = _generateIdNumber()
    const point = await PointHelper.add({ externalId: `9:${pointExternalId}` })
    await ReturnRequirementPointHelper.add({
      pointId: point.id,
      returnRequirementId: returnRequirement.id,
      externalId: `9:${returnRequirementLegacyId}:${pointExternalId}`
    })

    const purpose = await PurposeHelper.select()
    await ReturnRequirementPurposeHelper.add({
      purposeId: purpose.id,
      returnRequirementId: returnRequirement.id
    })

    sessionData = {
      data: {
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        returnReference: returnLog.returnReference,
        returnLogId: returnLog.id,
        returnSubmissionId: returnSubmission.id,
        returnVersionId: returnVersion.id,
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
        ],
        returnsFrequency: 'month'
      }
    }

    session = await SessionHelper.add(sessionData)
  })

  describe('when called with valid data', () => {
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
        result.returnSubmissionId
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

// We need the return requirement and point to have known numbers so we have to
// specify them otherwise the helper generates them randomly. However, the
// numbers must be different for each test to avoid violating the external id
// restraint. This helper function generates our random numbers
function _generateIdNumber() {
  return Math.floor(Math.random() * 9000) + 1000
}
