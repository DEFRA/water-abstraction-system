'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ChargingModuleRequestLib = require('../../../app/lib/charging-module-request.lib.js')

// Thing under test
const ChargingModuleRebillInvoiceService = require('../../../app/services/charging-module/rebill-invoice.service.js')

describe('Charge module rebill invoice service', () => {
  const invoiceId = '45ddee2c-c423-4382-8abe-a6a9f284f829'
  const billRunId = 'db82bf38-638a-44d3-b1b3-1ae8524d9c38'

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service can rebill an invoice', () => {
    beforeEach(async () => {
      Sinon.stub(ChargingModuleRequestLib, 'patch').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 200,
          body: {
            invoices: [
              {
                id: 'f62faabc-d65e-4242-a106-9777c1d57db7',
                rebilledType: 'C'
              },
              {
                id: 'db82bf38-638a-44d3-b1b3-1ae8524d9c38',
                rebilledType: 'R'
              }
            ]
          }
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await ChargingModuleRebillInvoiceService.go(billRunId, invoiceId)
      const endpoint = ChargingModuleRequestLib.patch.firstCall.firstArg

      expect(endpoint).to.equal(`v3/wrls/bill-runs/${billRunId}/invoices/${invoiceId}/rebill`)
    })

    it('returns a `true` success status', async () => {
      const result = await ChargingModuleRebillInvoiceService.go(billRunId, invoiceId)

      expect(result.succeeded).to.be.true()
    })

    it('returns the invoice in the `response`', async () => {
      const result = await ChargingModuleRebillInvoiceService.go(billRunId, invoiceId)

      expect(result.response.body.invoices[0].id).to.equal('f62faabc-d65e-4242-a106-9777c1d57db7')
      expect(result.response.body.invoices[0].rebilledType).to.equal('C')
      expect(result.response.body.invoices[1].id).to.equal('db82bf38-638a-44d3-b1b3-1ae8524d9c38')
      expect(result.response.body.invoices[1].rebilledType).to.equal('R')
    })
  })

  describe('when the service cannot create a bill run', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequestLib, 'patch').resolves({
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

      it('returns a `false` success status', async () => {
        const result = await ChargingModuleRebillInvoiceService.go(billRunId, invoiceId)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the `response`', async () => {
        const result = await ChargingModuleRebillInvoiceService.go(billRunId, invoiceId)

        expect(result.response.body.statusCode).to.equal(401)
        expect(result.response.body.error).to.equal('Unauthorized')
        expect(result.response.body.message).to.equal('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequestLib, 'patch').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a `false` success status', async () => {
        const result = await ChargingModuleRebillInvoiceService.go(billRunId, invoiceId)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the `response`', async () => {
        const result = await ChargingModuleRebillInvoiceService.go(billRunId, invoiceId)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
