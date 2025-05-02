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
const ReturnSubmissionModel = require('../../../../app/models/return-submission.model.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const ReturnSubmissionLineModel = require('../../../../app/models/return-submission-line.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/return-logs/setup/submit-check.service.js')

// TODO: Correctly stub dependencies
// TODO: Move tests into individual service test suites files
describe('Return Logs Setup - Submit Check service', () => {
  let licence
  let returnLog
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

    sessionData = {
      data: {
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        returnReference: returnLog.returnReference,
        returnLogId: returnLog.id,
        returnSubmissionId: returnSubmission.id,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        journey: 'enter-return',
        lines: [
          {
            startDate: '2023-01-01T00:00:00.000Z',
            endDate: '2023-01-31T00:00:00.000Z',
            quantity: 100,
            reading: null
          },
          {
            startDate: '2023-02-01T00:00:00.000Z',
            endDate: '2023-02-28T00:00:00.000Z',
            quantity: 200,
            reading: null
          }
        ],
        returnsFrequency: 'month',
        units: 'cubic-metres'
      }
    }

    session = await SessionHelper.add(sessionData)
  })

  describe('when called with valid data', () => {
    it('updates the return log status', async () => {
      await SubmitCheckService.go(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)

      expect(updatedReturnLog.status).to.equal('completed')
    })

    it('deletes the session', async () => {
      await SubmitCheckService.go(session.id, user)

      const deletedSession = await ReturnLogModel.query().findById(session.id)

      expect(deletedSession).to.not.exist()
    })

    it('creates a new return submission', async () => {
      await SubmitCheckService.go(session.id, user)

      const newReturnSubmission = await ReturnSubmissionModel.query()
        .where('returnLogId', returnLog.id)
        .where('version', 2)
        .first()

      expect(newReturnSubmission).to.exist()
    })

    it('creates return submission lines', async () => {
      await SubmitCheckService.go(session.id, user)

      const submissionLines = await ReturnSubmissionLineModel.query()
        .joinRelated('returnSubmission')
        .where('returnSubmission.returnLogId', returnLog.id)

      expect(submissionLines).to.have.length(2)

      expect(submissionLines[0].quantity).to.equal(100)
      expect(submissionLines[0].startDate.toISOString().split('T')[0]).to.equal('2023-01-01')
      expect(submissionLines[0].endDate.toISOString().split('T')[0]).to.equal('2023-01-31')

      expect(submissionLines[1].quantity).to.equal(200)
      expect(submissionLines[1].startDate.toISOString().split('T')[0]).to.equal('2023-02-01')
      expect(submissionLines[1].endDate.toISOString().split('T')[0]).to.equal('2023-02-28')
    })
  })
})
