'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

// Thing under test
const SubmitViewReturnLogService = require('../../../app/services/return-logs/submit-view-return-log.service.js')

describe('Submit View Return Log Service', () => {
  let payload
  let patchStub
  let mockReturnLog

  beforeEach(() => {
    mockReturnLog = ReturnLogModel.fromJson({ ...ReturnLogHelper.defaults() })

    patchStub = Sinon.stub().returnsThis()
    Sinon.stub(ReturnLogModel, 'query').returns({
      patch: patchStub,
      where: Sinon.stub().withArgs(mockReturnLog.returnId).resolves()
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
        await SubmitViewReturnLogService.go(payload, mockReturnLog.returnId)

        // Check we save the status change
        const [patchObject] = patchStub.args[0]

        expect(patchObject).to.equal({ underQuery: true }, { skip: ['updatedAt'] })
      })
    })

    describe('and the user is marking the return log query as resolved', () => {
      beforeEach(() => {
        payload = { 'mark-query': 'resolve' }
      })

      it('updates the "underQuery" flag on the return log to false', async () => {
        await SubmitViewReturnLogService.go(payload, mockReturnLog.returnId)

        // Check we save the status change
        const [patchObject] = patchStub.args[0]

        expect(patchObject).to.equal({ underQuery: false }, { skip: ['updatedAt'] })
      })
    })
  })
})
