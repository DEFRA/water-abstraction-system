'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ChargingModuleRequest = require('../../../app/requests/charging-module.request.js')

// Thing under test
const ChargingModuleViewCustomerFilesRequest = require('../../../app/requests/charging-module/view-customer-files.request.js')

describe('Charging Module - View Customer Files request', () => {
  const days = 7

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
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
          },
          statusCode: 200,
          body: [
            {
              id: '9523ff61-bd21-4800-aa7d-d97aa6c923aa',
              fileReference: 'nalac50001',
              status: 'exported',
              exportedAt: '2025-08-10T12:34:56.789Z',
              exportedCustomers: ['AB01BEEB', 'BB01BEEB', 'CB01BEEB']
            },
            {
              id: 'aa271bc5-0e36-4aeb-b636-64d95482825f',
              fileReference: 'nalac50002',
              status: 'exported',
              exportedAt: '2025-08-11T13:57:24.680Z',
              exportedCustomers: ['DB02BEEB', 'EB02BEEB', 'FB02BEEB']
            }
          ]
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await ChargingModuleViewCustomerFilesRequest.send(days)
      const endpoint = ChargingModuleRequest.get.firstCall.firstArg

      expect(endpoint).to.equal(`v3/wrls/customer-files/${days}`)
    })

    it('returns a true success status', async () => {
      const result = await ChargingModuleViewCustomerFilesRequest.send(days)

      expect(result.succeeded).to.be.true()
    })

    it('returns the customer files in the response', async () => {
      const result = await ChargingModuleViewCustomerFilesRequest.send(days)

      expect(result.response.body[0].id).to.equal('9523ff61-bd21-4800-aa7d-d97aa6c923aa')
      expect(result.response.body[1].id).to.equal('aa271bc5-0e36-4aeb-b636-64d95482825f')
    })
  })

  describe('when the service cannot view customer files', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequest, 'get').resolves({
          succeeded: false,
          response: {
            info: {
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.1'
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

      it('returns a false success status', async () => {
        const result = await ChargingModuleViewCustomerFilesRequest.send(days)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the response', async () => {
        const result = await ChargingModuleViewCustomerFilesRequest.send(days)

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

      it('returns a false success status', async () => {
        const result = await ChargingModuleViewCustomerFilesRequest.send(days)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the response', async () => {
        const result = await ChargingModuleViewCustomerFilesRequest.send(days)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
