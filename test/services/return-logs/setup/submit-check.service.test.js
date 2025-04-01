'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const ReturnVersionModel = require('../../../../app/models/return-version.model.js')
const SessionModel = require('../../../../app/models/session.model.js')
const ReturnLogModel = require('../../../../app/models/return-log.model.js')
const ReturnSubmissionLineModel = require('../../../../app/models/return-submission-line.model.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/return-logs/setup/submit-check.service.js')

describe('Return Logs Setup - Submit Check service', () => {
  let session
  let sessionData
  let user

  beforeEach(async () => {
    // Setup test data
    sessionData = {
      data: {
        returnReference: '12345',
        returnLog: {
          id: 'test-return-log-id',
          licenceId: 'test-licence-id'
        },
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        lines: [
          {
            startDate: '2023-01-01',
            endDate: '2023-01-31',
            quantity: 100
          },
          {
            startDate: '2023-02-01',
            endDate: '2023-02-28',
            quantity: 200
          }
        ]
      }
    }

    session = await SessionHelper.add(sessionData)

    user = {
      id: 'test-user-id',
      username: 'test.user@defra.gov.uk'
    }

    // Setup stubs
    Sinon.stub(ReturnVersionModel, 'query').returns({
      where: Sinon.stub().returnsThis(),
      first: Sinon.stub().resolves(null),
      max: Sinon.stub().returnsThis(),
      patch: Sinon.stub().resolves(),
      insert: Sinon.stub().resolves({
        id: 'new-return-version-id'
      })
    })

    Sinon.stub(ReturnLogModel, 'query').returns({
      where: Sinon.stub().returnsThis(),
      patch: Sinon.stub().resolves()
    })

    Sinon.stub(SessionModel, 'query').returns({
      findById: Sinon.stub().resolves(session),
      deleteById: Sinon.stub().resolves()
    })

    Sinon.stub(ReturnSubmissionLineModel, 'query').returns({
      insert: Sinon.stub().resolves()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with valid data', () => {
    it('creates a new return version', async () => {
      const result = await SubmitCheckService.go(session.id, user)

      expect(result.returnLogId).to.equal(sessionData.data.returnLog.id)
      expect(ReturnVersionModel.query().insert.called).to.be.true()
    })

    it('marks previous versions as not current', async () => {
      await SubmitCheckService.go(session.id, user)

      expect(ReturnVersionModel.query().patch.called).to.be.true()
    })

    it('updates the return log status', async () => {
      await SubmitCheckService.go(session.id, user)

      expect(ReturnLogModel.query().patch.called).to.be.true()
    })

    it('deletes the session', async () => {
      await SubmitCheckService.go(session.id, user)

      expect(SessionModel.query().deleteById.called).to.be.true()
    })

    it('creates return submission lines', async () => {
      await SubmitCheckService.go(session.id, user)

      expect(ReturnSubmissionLineModel.query().insert.called).to.be.true()

      // Verify the correct data is passed to insert
      const expectedLines = sessionData.data.lines.map((line) => ({
        returnSubmissionId: 'new-return-version-id',
        startDate: new Date(line.startDate),
        endDate: new Date(line.endDate),
        quantity: line.quantity
      }))

      expect(ReturnSubmissionLineModel.query().insert.firstCall.args[0]).to.deep.equal(expectedLines)
    })
  })

  describe('when session is not found', () => {
    beforeEach(() => {
      SessionModel.query().findById.resolves(null)
    })

    it('returns an error', async () => {
      const result = await SubmitCheckService.go('invalid-session-id', user)

      expect(result.error).to.exist()
      expect(result.error.message).to.equal('Session not found')
    })
  })

  describe('when an error occurs during processing', () => {
    beforeEach(() => {
      ReturnVersionModel.query().insert.rejects(new Error('Test error'))
    })

    it('returns an error', async () => {
      const result = await SubmitCheckService.go(session.id, user)

      expect(result.error).to.exist()
      expect(result.error.message).to.equal('Test error')
    })
  })
})
