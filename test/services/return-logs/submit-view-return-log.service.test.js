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
  let yarStub

  beforeEach(async () => {
    mockReturnLog = ReturnLogModel.fromJson({ ...ReturnLogHelper.defaults() })

    patchStub = Sinon.stub().resolves()
    Sinon.stub(ReturnLogModel, 'query').returns({
      findById: Sinon.stub().withArgs(mockReturnLog.id).returnsThis(),
      patch: patchStub
    })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the user is marking the return log as under query', () => {
      beforeEach(() => {
        payload = { 'mark-query': 'mark' }
      })

      it('sets a flash message and updates the status of the return log', async () => {
        await SubmitViewReturnLogService.go(mockReturnLog.id, yarStub, payload)

        // Check we save the status change
        const [patchObject] = patchStub.args[0]

        expect(patchObject).to.equal({ underQuery: true })

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('This return has been marked under query.')
      })
    })

    describe('and the user is marking the return log query as resolved', () => {
      beforeEach(() => {
        payload = { 'mark-query': 'resolve' }
      })

      it('updates the status of the return log with no flash message set', async () => {
        await SubmitViewReturnLogService.go(mockReturnLog.id, yarStub, payload)

        // Check we save the status change
        const [patchObject] = patchStub.args[0]

        expect(patchObject).to.equal({ underQuery: false })

        // Check there is no flash message
        const flashArgs = yarStub.flash.args[0]

        expect(flashArgs).to.not.exist()
      })
    })
  })
})
