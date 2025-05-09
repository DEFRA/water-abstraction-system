'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnSubmissionHelper = require('../../../support/helpers/return-submission.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')

// Things we need to stub
const CreateReturnLinesService = require('../../../../app/services/return-logs/setup/create-return-lines.service.js')
const CreateReturnSubmissionService = require('../../../../app/services/return-logs/setup/create-return-submission.service.js')
const GenerateReturnSubmissionMetadata = require('../../../../app/services/return-logs/setup/generate-return-submission-metadata.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/return-logs/setup/submit-check.service.js')

describe('Return Logs Setup - Submit Check service', () => {
  let licence
  let returnLog
  let session
  let sessionData
  let user
  let sandbox

  let generateReturnSubmissionMetadataStub
  let createReturnSubmissionServiceStub
  let createReturnLinesServiceStub

  const mockGeneratedMetadata = {
    generated: 'metadata',
    source: 'test-stub'
  }

  const mockNewReturnSubmissionId = 'new-submission-id-from-stub'

  beforeEach(async () => {
    sandbox = Sinon.createSandbox()

    user = await UserHelper.add()
    licence = await LicenceHelper.add()
    returnLog = await ReturnLogHelper.add({
      licenceRef: licence.licenceRef,
      status: 'due'
    })

    const initialReturnSubmission = await ReturnSubmissionHelper.add({
      returnLogId: returnLog.id
    })

    sessionData = {
      data: {
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        returnReference: returnLog.returnReference,
        returnLogId: returnLog.id,
        returnSubmissionId: initialReturnSubmission.id,
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
        units: 'cubic-metres',
        meterProvided: false
      }
    }
    session = await SessionHelper.add(sessionData)

    generateReturnSubmissionMetadataStub = sandbox
      .stub(GenerateReturnSubmissionMetadata, 'go')
      .returns(mockGeneratedMetadata)

    createReturnSubmissionServiceStub = sandbox
      .stub(CreateReturnSubmissionService, 'go')
      .resolves({ id: mockNewReturnSubmissionId })

    createReturnLinesServiceStub = sandbox.stub(CreateReturnLinesService, 'go').resolves()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('when called with valid data', () => {
    it('updates the return log status to completed', async () => {
      await SubmitCheckService.go(session.id, user)

      const updatedReturnLog = await ReturnLogModel.query().findById(returnLog.id)
      expect(updatedReturnLog.status).to.equal('completed')
    })

    it('deletes the session', async () => {
      await SubmitCheckService.go(session.id, user)

      const deletedSession = await SessionModel.query().findById(session.id)
      expect(deletedSession).to.not.exist()
    })

    it('generates metadata for the return submission', async () => {
      const sessionInstance = await SessionModel.query().findById(session.id)
      await SubmitCheckService.go(session.id, user)

      expect(generateReturnSubmissionMetadataStub.calledOnce).to.be.true()
      expect(generateReturnSubmissionMetadataStub.calledWithExactly(sessionInstance)).to.be.true()
    })

    it('calls CreateReturnSubmissionService with correct parameters including transaction', async () => {
      await SubmitCheckService.go(session.id, user)

      expect(createReturnSubmissionServiceStub.calledOnce).to.be.true()
      const callArgs = createReturnSubmissionServiceStub.firstCall.args
      expect(callArgs[0]).to.equal(returnLog.id)
      expect(callArgs[1]).to.equal(user.username)
      expect(callArgs[2]).to.equal('internal')
      expect(callArgs[3]).to.equal(mockGeneratedMetadata)
      expect(callArgs[4]).to.equal(sessionData.data.journey === 'nil-return')
    })

    it('calls CreateReturnLinesService with correct parameters including transaction and new submission ID', async () => {
      await SubmitCheckService.go(session.id, user)

      expect(createReturnLinesServiceStub.calledOnce).to.be.true()
      const callArgs = createReturnLinesServiceStub.firstCall.args
      expect(callArgs[0]).to.equal(sessionData.data.lines)
      expect(callArgs[1]).to.equal(mockNewReturnSubmissionId)
      expect(callArgs[2]).to.equal(sessionData.data.returnsFrequency)
      expect(callArgs[3]).to.equal(sessionData.data.units)
      expect(callArgs[4]).to.equal(sessionData.data.meterProvided)
    })

    it('returns the original returnLogId', async () => {
      const result = await SubmitCheckService.go(session.id, user)

      expect(result).to.equal(returnLog.id)
    })
  })
})
