'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Things we need to stub
const CalculateChargeRequest = require('../../../../app/requests/charging-module/calculate-charge.request.js')
const FetchReviewChargeReferenceService = require('../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js')

// Thing under test
const PreviewService = require('../../../../app/services/bill-runs/review/preview.service.js')

describe('Bill Runs Review - Preview service', () => {
  let calculateChargeRequestStub
  let reviewChargeReference
  let yarStub

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('for a review charge reference with a total allocation that is greater than zero', () => {
      beforeEach(() => {
        reviewChargeReference.reviewChargeElements[0].amendedAllocated = 9.092

        Sinon.stub(FetchReviewChargeReferenceService, 'go').resolves(reviewChargeReference)
      })

      describe('and the request to the Charging Module API succeeds', () => {
        beforeEach(async () => {
          calculateChargeRequestStub = Sinon.stub(CalculateChargeRequest, 'send').resolves({
            succeeded: true,
            response: {
              info: {
                gitCommit: '273604040a47e0977b0579a0fef0f09726d95e39',
                dockerTag: 'ghcr.io/defra/sroc-charging-module-api:v0.19.0'
              },
              statusCode: 200,
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
            await PreviewService.go(reviewChargeReference.id, yarStub)

            const generatedTransaction = calculateChargeRequestStub.args[0][0]

            expect(generatedTransaction).to.equal({
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
            await PreviewService.go(reviewChargeReference.id, yarStub)

            const [flashType, bannerMessage] = yarStub.flash.args[0]

            expect(yarStub.flash.called).to.be.true()
            expect(flashType).to.equal('charge')
            expect(bannerMessage).to.equal('Based on this information the example charge is £20.00')
          })
        })

        describe('for a charge reference with additional charges ({})', () => {
          beforeEach(async () => {
            reviewChargeReference.chargeReference.supportedSourceName = 'Support me please'
            reviewChargeReference.chargeReference.waterCompanyCharge = false
          })

          it('makes the correct request to the Charging Module API', async () => {
            await PreviewService.go(reviewChargeReference.id, yarStub)

            const generatedTransaction = calculateChargeRequestStub.args[0][0]

            expect(generatedTransaction).to.equal({
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
            await PreviewService.go(reviewChargeReference.id, yarStub)

            const [flashType, bannerMessage] = yarStub.flash.args[0]

            expect(yarStub.flash.called).to.be.true()
            expect(flashType).to.equal('charge')
            expect(bannerMessage).to.equal('Based on this information the example charge is £20.00')
          })
        })
      })

      describe('and the request to the Charging Module API fails', () => {
        beforeEach(async () => {
          Sinon.stub(CalculateChargeRequest, 'send').resolves({
            succeeded: false,
            response: {
              info: { gitCommit: undefined, dockerTag: undefined },
              statusCode: 422,
              body: {
                statusCode: 422,
                error: 'Unprocessable Entity',
                message: '"section127Agreement" must be [true]'
              }
            }
          })
        })

        it('adds a flash message stating the charge could not be calculated', async () => {
          await PreviewService.go(reviewChargeReference.id, yarStub)

          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(yarStub.flash.called).to.be.true()
          expect(flashType).to.equal('charge')
          expect(bannerMessage).to.equal('Could not calculate a charge. "section127Agreement" must be [true].')
        })
      })
    })

    describe('for a review charge reference with a total allocation that is 0', () => {
      beforeEach(() => {
        Sinon.stub(FetchReviewChargeReferenceService, 'go').resolves(reviewChargeReference)

        calculateChargeRequestStub = Sinon.stub(CalculateChargeRequest, 'send').resolves()
      })

      it('adds a flash message stating the example charge is £0.00 and skips calling the Charging Module API', async () => {
        await PreviewService.go(reviewChargeReference.id, yarStub)

        expect(calculateChargeRequestStub.called).to.be.false()

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(yarStub.flash.called).to.be.true()
        expect(flashType).to.equal('charge')
        expect(bannerMessage).to.equal('Based on this information the example charge is £0.00')
      })
    })
  })
})
