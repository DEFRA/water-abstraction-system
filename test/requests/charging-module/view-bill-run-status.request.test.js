'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const ChargingModuleRequest = require('../../../app/requests/charging-module.request.js')

// Thing under test
const ViewBillRunStatusRequest = require('../../../app/requests/charging-module/view-bill-run-status.request.js')

describe('Charging Module View Bill Run Status request', () => {
  const billRunId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'
  const transactionData = { billingTransactionId: '2395429b-e703-43bc-8522-ce3f67507ffa' }

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request can get a bill run status', () => {
    beforeEach(async () => {
      Sinon.stub(ChargingModuleRequest, 'get').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 200,
          body: {
            status: 'initialised'
          }
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

      expect(result.succeeded).to.be.true()
    })

    it('returns the bill run status in the "response"', async () => {
      const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

      expect(result.response.body.status).to.equal('initialised')
    })
  })

  describe('when the request cannot get a bill run status', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequest, 'get').resolves({
          succeeded: false,
          response: {
            info: {
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
            },
            statusCode: 401,
            body: {
              statusCode: 401,
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              attributes: { error: 'Invalid JWT: Token format not valid' }
            }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

        expect(result.response.body.statusCode).to.equal(401)
        expect(result.response.body.error).to.equal('Unauthorized')
        expect(result.response.body.message).to.equal('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequest, 'get').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewBillRunStatusRequest.send(billRunId, transactionData)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
