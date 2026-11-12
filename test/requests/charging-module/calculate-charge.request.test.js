// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as ChargingModuleRequest from '../../../src/requests/charging-module.request.js'

// Thing under test
import CalculateChargeRequest from '../../../src/requests/charging-module/calculate-charge.request.js'

const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = http2.constants

describe('Charging Module Calculate Charge request', () => {
  const transactionData = _transactionData()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the charge can be calculated', () => {
    beforeEach(async () => {
      vi.spyOn(ChargingModuleRequest, 'postRequest').mockResolvedValue({
        response: {
          body: {
            calculation: {
              baseCharge: 9700,
              chargeValue: 7000,
              compensationChargePercent: null,
              section127Factor: 0.5,
              section130Factor: null,
              supportedSourceValue: 3500,
              waterCompanyChargeValue: 800,
              winterOnlyFactor: null
            }
          },
          info: {
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0',
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39'
          },
          statusCode: HTTP_STATUS_OK
        },
        succeeded: true
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CalculateChargeRequest(transactionData)

      expect(result.succeeded).toBe(true)
    })

    it('returns the results of the calculation in the "response"', async () => {
      const result = await CalculateChargeRequest(transactionData)

      expect(result.response.body.calculation.chargeValue).toEqual(7000)
      expect(result.response.body.calculation.baseCharge).toEqual(9700)
      expect(result.response.body.calculation.waterCompanyChargeValue).toEqual(800)
      expect(result.response.body.calculation.supportedSourceValue).toEqual(3500)
      expect(result.response.body.calculation.winterOnlyFactor).toBeNull()
      expect(result.response.body.calculation.section130Factor).toBeNull()
      expect(result.response.body.calculation.section127Factor).toEqual(0.5)
      expect(result.response.body.calculation.compensationChargePercent).toBeNull()
    })
  })

  describe('when the request cannot calculate a charge', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'postRequest').mockResolvedValue({
          response: {
            body: {
              attributes: { error: 'Invalid JWT: Token format not valid' },
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              statusCode: HTTP_STATUS_UNAUTHORIZED
            },
            info: {
              dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0',
              gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39'
            },
            statusCode: HTTP_STATUS_UNAUTHORIZED
          },
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CalculateChargeRequest(transactionData)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CalculateChargeRequest(transactionData)

        expect(result.response.body.statusCode).toEqual(HTTP_STATUS_UNAUTHORIZED)
        expect(result.response.body.error).toEqual('Unauthorized')
        expect(result.response.body.message).toEqual('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(ChargingModuleRequest, 'postRequest').mockResolvedValue({
          response: new Error("Timeout awaiting 'request' for 5000ms"),
          succeeded: false
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CalculateChargeRequest(transactionData)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CalculateChargeRequest(transactionData)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
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
    periodEnd: '31-MAR-2023',
    periodStart: '01-APR-2022',
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
