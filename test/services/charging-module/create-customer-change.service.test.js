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
const ChargingModuleCreateCustomerChangeService = require('../../../app/services/charging-module/create-customer-change.service.js')

describe('Charging module create customer change service', () => {
  const requestData = {
    region: 'B',
    customerReference: 'B88891136A',
    customerName: 'SCP ESTATE LIMITED',
    addressLine1: 'FAO Mr V P Anderson MBE',
    addressLine2: 'ENVIRONMENT AGENCY',
    addressLine3: 'HORIZON HOUSE',
    addressLine4: 'DEANERY ROAD',
    addressLine5: 'BRISTOL',
    addressLine6: 'United Kingdom',
    postcode: 'BS1 5AH'
  }

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service can create a customer change', () => {
    beforeEach(async () => {
      Sinon.stub(ChargingModuleRequestLib, 'post').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 201
        }
      })
    })

    it('returns a `true` success status', async () => {
      const result = await ChargingModuleCreateCustomerChangeService.go(requestData)

      expect(result.succeeded).to.be.true()
    })
  })

  describe('when the service cannot create a customer change', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequestLib, 'post').resolves({
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
        const result = await ChargingModuleCreateCustomerChangeService.go(requestData)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the `response`', async () => {
        const result = await ChargingModuleCreateCustomerChangeService.go(requestData)

        expect(result.response.body.statusCode).to.equal(401)
        expect(result.response.body.error).to.equal('Unauthorized')
        expect(result.response.body.message).to.equal('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequestLib, 'post').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a `false` success status', async () => {
        const result = await ChargingModuleCreateCustomerChangeService.go(requestData)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the `response`', async () => {
        const result = await ChargingModuleCreateCustomerChangeService.go(requestData)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
