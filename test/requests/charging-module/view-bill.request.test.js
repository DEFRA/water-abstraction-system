'use strict'

const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = require('node:http2').constants

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const ChargingModuleRequest = require('../../../app/requests/charging-module.request.js')

// Thing under test
const ViewBillRequest = require('../../../app/requests/charging-module/view-bill.request.js')

describe('Charging Module View Bill request', () => {
  const billId = '45ddee2c-c423-4382-8abe-a6a9f284f829'
  const billRunId = 'db82bf38-638a-44d3-b1b3-1ae8524d9c38'

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request can view an invoice', () => {
    beforeEach(async () => {
      Sinon.stub(ChargingModuleRequest, 'get').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: HTTP_STATUS_OK,
          body: {
            // truncated invoice, see CM docs for full invoice https://defra.github.io/sroc-charging-module-api-docs
            invoice: {
              id: billId,
              billRunId
            }
          }
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await ViewBillRequest.send(billRunId, billId)
      const endpoint = ChargingModuleRequest.get.firstCall.firstArg

      expect(endpoint).toEqual(`v3/wrls/bill-runs/${billRunId}/invoices/${billId}`)
    })

    it('returns a "true" success status', async () => {
      const result = await ViewBillRequest.send(billRunId, billId)

      expect(result.succeeded).toBe(true)
    })

    it('returns the bill in the "response"', async () => {
      const result = await ViewBillRequest.send(billRunId, billId)

      expect(result.response.body.invoice.id).toEqual(billId)
      expect(result.response.body.invoice.billRunId).toEqual(billRunId)
    })
  })

  describe('when the request cannot view a bill run', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequest, 'get').resolves({
          succeeded: false,
          response: {
            info: {
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
            },
            statusCode: HTTP_STATUS_UNAUTHORIZED,
            body: {
              statusCode: HTTP_STATUS_UNAUTHORIZED,
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              attributes: { error: 'Invalid JWT: Token format not valid' }
            }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewBillRequest.send(billRunId, billId)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewBillRequest.send(billRunId, billId)

        expect(result.response.body.statusCode).toEqual(HTTP_STATUS_UNAUTHORIZED)
        expect(result.response.body.error).toEqual('Unauthorized')
        expect(result.response.body.message).toEqual('Invalid JWT: Token format not valid')
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
        const result = await ViewBillRequest.send(billRunId, billId)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewBillRequest.send(billRunId, billId)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
