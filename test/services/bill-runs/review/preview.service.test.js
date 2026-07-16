// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'
import BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as CalculateChargeRequest from '../../../../app/requests/charging-module/calculate-charge.request.js'
import * as FetchReviewChargeReferenceService from '../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js'

// Thing under test
import PreviewService from '../../../../app/services/bill-runs/review/preview.service.js'

const { HTTP_STATUS_OK, HTTP_STATUS_UNPROCESSABLE_ENTITY } = http2.constants

describe('Bill Runs Review - Preview service', () => {
  let calculateChargeRequestStub
  let reviewChargeReference
  let yarStub

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('for a review charge reference with a total allocation that is greater than zero', () => {
      beforeEach(() => {
        reviewChargeReference.reviewChargeElements[0].amendedAllocated = 9.092

        vi.spyOn(FetchReviewChargeReferenceService, 'default').mockResolvedValue(reviewChargeReference)
      })

      describe('and the request to the Charging Module API succeeds', () => {
        beforeEach(async () => {
          calculateChargeRequestStub = vi.spyOn(CalculateChargeRequest, 'send').mockResolvedValue({
            succeeded: true,
            response: {
              info: {
                gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
                dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
              },
              statusCode: HTTP_STATUS_OK,
              body: {
                calculation: {
                  chargeValue: 2000,
                  baseCharge: 12000,
                  waterCompanyChargeValue: 0,
                  supportedSourceValue: 0,
                  winterOnlyFactor: null,
                  section130Factor: null,
                  section127Factor: 0.5,
                  compensationChargePercent: null
                }
              }
            }
          })
        })

        describe('for a charge reference with no additional charges (null)', () => {
          it('makes the correct request to the Charging Module API', async () => {
            await PreviewService(reviewChargeReference.id, yarStub)

            const generatedTransaction = calculateChargeRequestStub.mock.calls[0][0]

            expect(generatedTransaction).toEqual({
              abatementFactor: 1,
              actualVolume: 9.092,
              adjustmentFactor: 1,
              aggregateProportion: 0.333333333,
              authorisedDays: 0,
              authorisedVolume: 9.092,
              billableDays: 0,
              chargeCategoryCode: '4.6.5',
              compensationCharge: false,
              credit: false,
              loss: 'high',
              periodStart: '01-APR-2023',
              periodEnd: '31-MAR-2024',
              ruleset: 'sroc',
              section127Agreement: true,
              section130Agreement: false,
              supportedSource: false,
              supportedSourceName: null,
              twoPartTariff: true,
              waterCompanyCharge: false,
              waterUndertaker: false,
              winterOnly: false
            })
          })

          it('adds a flash message stating the example charge returned by the Charging Module API', async () => {
            await PreviewService(reviewChargeReference.id, yarStub)

            const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

            expect(yarStub.flash).toHaveBeenCalled()
            expect(flashType).toEqual('charge')
            expect(bannerMessage).toEqual('Based on this information the example charge is £20.00')
          })
        })

        describe('for a charge reference with additional charges ({})', () => {
          beforeEach(async () => {
            reviewChargeReference.chargeReference.supportedSourceName = 'Support me please'
            reviewChargeReference.chargeReference.waterCompanyCharge = false
          })

          it('makes the correct request to the Charging Module API', async () => {
            await PreviewService(reviewChargeReference.id, yarStub)

            const generatedTransaction = calculateChargeRequestStub.mock.calls[0][0]

            expect(generatedTransaction).toEqual({
              abatementFactor: 1,
              actualVolume: 9.092,
              adjustmentFactor: 1,
              aggregateProportion: 0.333333333,
              authorisedDays: 0,
              authorisedVolume: 9.092,
              billableDays: 0,
              chargeCategoryCode: '4.6.5',
              compensationCharge: false,
              credit: false,
              loss: 'high',
              periodStart: '01-APR-2023',
              periodEnd: '31-MAR-2024',
              ruleset: 'sroc',
              section127Agreement: true,
              section130Agreement: false,
              supportedSource: true,
              supportedSourceName: 'Support me please',
              twoPartTariff: true,
              waterCompanyCharge: false,
              waterUndertaker: false,
              winterOnly: false
            })
          })

          it('adds a flash message stating the example charge returned by the Charging Module API', async () => {
            await PreviewService(reviewChargeReference.id, yarStub)

            const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

            expect(yarStub.flash).toHaveBeenCalled()
            expect(flashType).toEqual('charge')
            expect(bannerMessage).toEqual('Based on this information the example charge is £20.00')
          })
        })
      })

      describe('and the request to the Charging Module API fails', () => {
        beforeEach(async () => {
          vi.spyOn(CalculateChargeRequest, 'send').mockResolvedValue({
            succeeded: false,
            response: {
              info: { gitCommit: undefined, dockerTag: undefined },
              statusCode: HTTP_STATUS_UNPROCESSABLE_ENTITY,
              body: {
                statusCode: HTTP_STATUS_UNPROCESSABLE_ENTITY,
                error: 'Unprocessable Entity',
                message: '"section127Agreement" must be [true]'
              }
            }
          })
        })

        it('adds a flash message stating the charge could not be calculated', async () => {
          await PreviewService(reviewChargeReference.id, yarStub)

          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(yarStub.flash).toHaveBeenCalled()
          expect(flashType).toEqual('charge')
          expect(bannerMessage).toEqual('Could not calculate a charge. "section127Agreement" must be [true].')
        })
      })
    })

    describe('for a review charge reference with a total allocation that is 0', () => {
      beforeEach(() => {
        vi.spyOn(FetchReviewChargeReferenceService, 'default').mockResolvedValue(reviewChargeReference)

        calculateChargeRequestStub = vi.spyOn(CalculateChargeRequest, 'send').mockResolvedValue()
      })

      it('adds a flash message stating the example charge is £0.00 and skips calling the Charging Module API', async () => {
        await PreviewService(reviewChargeReference.id, yarStub)

        expect(calculateChargeRequestStub).not.toHaveBeenCalled()

        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(yarStub.flash).toHaveBeenCalled()
        expect(flashType).toEqual('charge')
        expect(bannerMessage).toEqual('Based on this information the example charge is £0.00')
      })
    })
  })
})
