// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as ChargingModuleRequest from '../../../app/requests/charging-module.request.js'

// Thing under test
import CalculateChargeRequest from '../../../app/requests/charging-module/calculate-charge.request.js'

const { HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } = http2.constants

describe('Charging Module Calculate Charge request', () => {
  const transactionData = _transactionData()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the charge can be calculated', () => {
    beforeEach(async () => {
      vi.spyOn(ChargingModuleRequest, 'postRequest').mockResolvedValue({
        succeeded: true,
        response: {
          info: {
            gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
            dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
          },
          statusCode: HTTP_STATUS_OK,
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
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
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
