'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const ExpandedError = require('../../../app/errors/expanded.error.js')

// Things we need to stub
const ChargingModuleRequest = require('../../../app/requests/charging-module.request.js')
const WaitForStatusRequest = require('../../../app/requests/charging-module/wait-for-status.request.js')

// Thing under test
const SendBillRunRequest = require('../../../app/requests/charging-module/send-bill-run.request.js')

describe('Charging Module Send Bill Run request', () => {
  const billRunId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'

  let chargingModuleRequestStub

  beforeEach(() => {
    chargingModuleRequestStub = Sinon.stub(ChargingModuleRequest, 'patch')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request can send a bill run', () => {
    beforeEach(async () => {
      chargingModuleRequestStub.resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 204,
          body: null
        }
      })
      Sinon.stub(WaitForStatusRequest, 'send').resolves({ succeeded: true, status: 'billed', attempts: 1 })
    })

    it('returns a "true" success status', async () => {
      const result = await SendBillRunRequest.send(billRunId)

      expect(result.succeeded).to.be.true()
    })

    it('returns the last status received', async () => {
      const result = await SendBillRunRequest.send(billRunId)

      expect(result.status).to.equal('billed')
    })

    it('returns the number of attempts', async () => {
      const result = await SendBillRunRequest.send(billRunId)

      expect(result.attempts).to.equal(1)
    })
  })

  describe('when the request cannot send a bill run', () => {
    describe('because the approve request fails', () => {
      beforeEach(async () => {
        chargingModuleRequestStub.onFirstCall().resolves({
          succeeded: false,
          response: { body: 'Boom' }
        })
      })

      it('throws an error', async () => {
        const error = await expect(SendBillRunRequest.send(billRunId)).to.reject()

        expect(error).to.be.instanceOf(ExpandedError)
        expect(error.message).to.equal('Charging Module approve request failed')
        expect(error.billRunExternalId).to.equal(billRunId)
        expect(error.responseBody).to.equal('Boom')
      })
    })

    describe('because the send request fails', () => {
      beforeEach(async () => {
        chargingModuleRequestStub.onFirstCall().resolves({ succeeded: true })
        chargingModuleRequestStub.onSecondCall().resolves({
          succeeded: false,
          response: { body: 'Boom' }
        })
      })

      it('throws an error', async () => {
        const error = await expect(SendBillRunRequest.send(billRunId)).to.reject()

        expect(error).to.be.instanceOf(ExpandedError)
        expect(error.message).to.equal('Charging Module send request failed')
        expect(error.billRunExternalId).to.equal(billRunId)
        expect(error.responseBody).to.equal('Boom')
      })
    })

    describe('because the wait request fails', () => {
      beforeEach(async () => {
        chargingModuleRequestStub.onFirstCall().resolves({ succeeded: true })
        chargingModuleRequestStub.onSecondCall().resolves({ succeeded: true })
        Sinon.stub(WaitForStatusRequest, 'send').resolves({
          succeeded: false,
          attempts: 100,
          response: { body: 'Boom' }
        })
      })

      it('throws an error', async () => {
        const error = await expect(SendBillRunRequest.send(billRunId)).to.reject()

        expect(error).to.be.instanceOf(ExpandedError)
        expect(error.message).to.equal('Charging Module wait request failed')
        expect(error.billRunExternalId).to.equal(billRunId)
        expect(error.attempts).to.equal(100)
        expect(error.responseBody).to.equal('Boom')
      })
    })
  })
})
