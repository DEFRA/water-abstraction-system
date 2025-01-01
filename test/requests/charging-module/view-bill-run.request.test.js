'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const ChargingModuleRequest = require('../../../app/requests/charging-module.request.js')

// Thing under test
const ChargingModuleViewBillRunRequest = require('../../../app/requests/charging-module/view-bill-run.request.js')

describe('Charging Module View Bill Run request', () => {
  const billRunId = 'db82bf38-638a-44d3-b1b3-1ae8524d9c38'

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service can view a bill run', () => {
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
            // truncated invoice, see CM docs for full invoice https://defra.github.io/sroc-charging-module-api-docs
            invoice: {
              id: '8e32a958-13f3-4ea3-a92d-651b764c2cbe',
              billRunId
            }
          }
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await ChargingModuleViewBillRunRequest.send(billRunId)
      const endpoint = ChargingModuleRequest.get.firstCall.firstArg

      expect(endpoint).to.equal(`v3/wrls/bill-runs/${billRunId}`)
    })

    it('returns a "true" success status', async () => {
      const result = await ChargingModuleViewBillRunRequest.send(billRunId)

      expect(result.succeeded).to.be.true()
    })

    it('returns the bill run in the "response"', async () => {
      const result = await ChargingModuleViewBillRunRequest.send(billRunId)

      expect(result.response.body.invoice.billRunId).to.equal(billRunId)
    })
  })

  describe('when the service cannot view a bill run', () => {
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
        const result = await ChargingModuleViewBillRunRequest.send(billRunId)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await ChargingModuleViewBillRunRequest.send(billRunId)

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
        const result = await ChargingModuleViewBillRunRequest.send(billRunId)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await ChargingModuleViewBillRunRequest.send(billRunId)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
