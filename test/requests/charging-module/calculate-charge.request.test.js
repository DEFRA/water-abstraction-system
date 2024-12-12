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
const CalculateChargeRequest = require('../../../app/requests/charging-module/calculate-charge.request.js')

describe('Charging Module Calculate Charge request', () => {
  const transactionData = _transactionData()

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the charge can be calculated', () => {
    beforeEach(async () => {
      Sinon.stub(ChargingModuleRequest, 'post').resolves({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: 200,
          body: {
            calculation: {
              chargeValue: 7000,
              baseCharge: 9700,
              waterCompanyChargeValue: 800,
              supportedSourceValue: 3500,
              winterOnlyFactor: null,
              section130Factor: null,
              section127Factor: 0.5,
              compensationChargePercent: null
            }
          }
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CalculateChargeRequest.send(transactionData)

      expect(result.succeeded).to.be.true()
    })

    it('returns the results of the calculation in the "response"', async () => {
      const result = await CalculateChargeRequest.send(transactionData)

      expect(result.response.body.calculation.chargeValue).to.equal(7000)
      expect(result.response.body.calculation.baseCharge).to.equal(9700)
      expect(result.response.body.calculation.waterCompanyChargeValue).to.equal(800)
      expect(result.response.body.calculation.supportedSourceValue).to.equal(3500)
      expect(result.response.body.calculation.winterOnlyFactor).to.be.null()
      expect(result.response.body.calculation.section130Factor).to.be.null()
      expect(result.response.body.calculation.section127Factor).to.equal(0.5)
      expect(result.response.body.calculation.compensationChargePercent).to.be.null()
    })
  })

  describe('when the request cannot calculate a charge', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequest, 'post').resolves({
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
        const result = await CalculateChargeRequest.send(transactionData)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await CalculateChargeRequest.send(transactionData)

        expect(result.response.body.statusCode).to.equal(401)
        expect(result.response.body.error).to.equal('Unauthorized')
        expect(result.response.body.message).to.equal('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(ChargingModuleRequest, 'post').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CalculateChargeRequest.send(transactionData)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await CalculateChargeRequest.send(transactionData)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})

function _transactionData() {
  return {
    abatementFactor: 1.0,
    actualVolume: 1.0,
    adjustmentFactor: 1.0,
    aggregateProportion: 1.0,
    authorisedDays: 21,
    authorisedVolume: 1.0,
    billableDays: 2,
    chargeCategoryCode: '4.1.1',
    compensationCharge: false,
    credit: false,
    loss: 'Low',
    periodStart: '01-APR-2022',
    periodEnd: '31-MAR-2023',
    ruleset: 'sroc',
    section127Agreement: true,
    section130Agreement: false,
    supportedSource: true,
    // If `supportedSource` is `true` then `supportedSourceName` must be present
    supportedSourceName: 'Candover',
    // If `twoPartTariff` is `true` then `section127Agreement` must also be `true`
    twoPartTariff: true,
    waterCompanyCharge: true,
    waterUndertaker: false,
    winterOnly: false
  }
}
