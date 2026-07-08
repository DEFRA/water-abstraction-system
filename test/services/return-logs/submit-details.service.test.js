'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

// Thing under test
const SubmitDetailsService = require('../../../app/services/return-logs/submit-details.service.js')

describe('Return Logs - Submit Details Service', () => {
  let payload
  let patchStub
  let mockReturnLog

  beforeEach(() => {
    mockReturnLog = ReturnLogModel.fromJson({ ...ReturnLogHelper.defaults() })

    patchStub = Sinon.stub().returnsThis()
    Sinon.stub(ReturnLogModel, 'query').returns({
      patch: patchStub,
      findById: Sinon.stub().withArgs(mockReturnLog.id).resolves()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user is marking the return log as under query', () => {
      beforeEach(() => {
        payload = { 'mark-query': 'mark' }
      })

      it('updates the "underQuery" flag on the return log to true', async () => {
        await SubmitDetailsService(payload, mockReturnLog.id)

        // Check we save the status change
        const [patchObject] = patchStub.args[0]

        expect(patchObject).toMatchObject({ underQuery: true })
      })
    })

    describe('and the user is marking the return log query as resolved', () => {
      beforeEach(() => {
        payload = { 'mark-query': 'resolve' }
      })

      it('updates the "underQuery" flag on the return log to false', async () => {
        await SubmitDetailsService(payload, mockReturnLog.id)

        // Check we save the status change
        const [patchObject] = patchStub.args[0]

        expect(patchObject).toMatchObject({ underQuery: false })
      })
    })
  })
})
