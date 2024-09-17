'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AmendAdjustmentFactorPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/amend-adjustment-factor.presenter.js')
const FetchReviewChargeReferenceService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-charge-reference.service.js')
const ReviewChargeReferenceHelper = require('../../../support/helpers/review-charge-reference.helper.js')
const ReviewChargeReferenceModel = require('../../../../app/models/review-charge-reference.model.js')

// Thing under test
const SubmitAmendedAdjustmentFactorService = require('../../../../app/services/bill-runs/two-part-tariff/submit-amended-adjustment-factor.service.js')

describe('Submit Amended Adjustment Factor Service', () => {
  const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
  const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'

  let payload
  let reviewChargeReference
  let yarStub

  beforeEach(async () => {
    yarStub = { flash: Sinon.stub() }

    reviewChargeReference = await ReviewChargeReferenceHelper.add()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload for aggregate factor', () => {
      beforeEach(async () => {
        // Note: Both values should always be present because the input box auto populates the original value before a
        // user can change it. If either aren't then this leads to a validation error
        payload = {
          amendedAggregateFactor: 0.5,
          amendedChargeAdjustment: 1
        }
      })

      it('saves the users entered value', async () => {
        await SubmitAmendedAdjustmentFactorService.go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

        const reviewChargeReferenceData = await _fetchReviewChargeReference(reviewChargeReference.id)

        expect(reviewChargeReferenceData.amendedAggregate).to.equal(0.5)
      })

      it('sets the banner message to "The adjustment factors for this licence have been updated"', async () => {
        await SubmitAmendedAdjustmentFactorService.go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('The adjustment factors for this licence have been updated')
      })
    })

    describe('with a valid payload for charge adjustment', () => {
      beforeEach(async () => {
        payload = {
          amendedAggregateFactor: 1,
          amendedChargeAdjustment: 0.7
        }
      })

      it('saves the users entered value', async () => {
        await SubmitAmendedAdjustmentFactorService.go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

        const reviewChargeReferenceData = await _fetchReviewChargeReference(reviewChargeReference.id)

        expect(reviewChargeReferenceData.amendedChargeAdjustment).to.equal(0.7)
      })

      it('sets the banner message to "The adjustment factors for this licence have been updated"', async () => {
        await SubmitAmendedAdjustmentFactorService.go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('The adjustment factors for this licence have been updated')
      })
    })

    describe('with a valid payload for both aggregate factor and charge adjustment', () => {
      beforeEach(async () => {
        payload = {
          amendedAggregateFactor: 0.2,
          amendedChargeAdjustment: 0.3
        }
      })

      it('saves the users entered value', async () => {
        await SubmitAmendedAdjustmentFactorService.go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

        const reviewChargeReferenceData = await _fetchReviewChargeReference(reviewChargeReference.id)

        expect(reviewChargeReferenceData.amendedAggregate).to.equal(0.2)
        expect(reviewChargeReferenceData.amendedChargeAdjustment).to.equal(0.3)
      })

      it('sets the banner message to "The adjustment factors for this licence have been updated"', async () => {
        await SubmitAmendedAdjustmentFactorService.go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('The adjustment factors for this licence have been updated')
      })
    })

    describe('when an invalid payload', () => {
      beforeEach(() => {
        Sinon.stub(FetchReviewChargeReferenceService, 'go').resolves({ billRun: 'bill run', reviewChargeReference: 'charge reference' })
        Sinon.stub(AmendAdjustmentFactorPresenter, 'go').returns(_amendAdjustmentFactorData())
      })

      describe('because the user left the aggregate factor input blank', () => {
        beforeEach(() => {
          payload = {
            amendedChargeAdjustment: 0.3
          }
        })

        it('returns the page data for the view', async () => {
          const result = await SubmitAmendedAdjustmentFactorService
            .go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'search',
            pageTitle: 'Set the adjustment factors',
            inputtedAggregateValue: undefined,
            inputtedChargeValue: 0.3,
            billRunId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
            licenceId: '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2',
            financialYear: '2022 to 2023',
            chargePeriod: '1 September 2022 to 31 March 2023',
            chargeReference: {
              id: 'e93fa3c6-195f-48eb-a03f-f87db7218f2d',
              description: 'High loss, non-tidal, greater than 50 up to and including 85 ML/yr',
              aggregateFactor: 0.5,
              chargeAdjustment: 0.5,
              otherAdjustments: ''
            }
          }, { skip: ['error'] })
        })

        it('returns the page data with an error for the aggregate factor input element', async () => {
          const result = await SubmitAmendedAdjustmentFactorService
            .go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

          expect(result.error).to.equal({
            aggregateFactorElement: { text: 'Enter a aggregate factor' },
            chargeAdjustmentElement: null
          })
        })
      })

      describe('because the user left the charge factor input blank', () => {
        beforeEach(() => {
          payload = {
            amendedAggregateFactor: 0.2
          }
        })

        it('returns the page data for the view', async () => {
          const result = await SubmitAmendedAdjustmentFactorService
            .go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'search',
            pageTitle: 'Set the adjustment factors',
            inputtedAggregateValue: 0.2,
            inputtedChargeValue: undefined,
            billRunId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
            licenceId: '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2',
            financialYear: '2022 to 2023',
            chargePeriod: '1 September 2022 to 31 March 2023',
            chargeReference: {
              id: 'e93fa3c6-195f-48eb-a03f-f87db7218f2d',
              description: 'High loss, non-tidal, greater than 50 up to and including 85 ML/yr',
              aggregateFactor: 0.5,
              chargeAdjustment: 0.5,
              otherAdjustments: ''
            }
          }, { skip: ['error'] })
        })

        it('returns the page data with an error for the charge factor input element', async () => {
          const result = await SubmitAmendedAdjustmentFactorService
            .go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

          expect(result.error).to.equal({
            aggregateFactorElement: null,
            chargeAdjustmentElement: { text: 'Enter a charge factor' }
          })
        })
      })

      describe('because the user left both the aggregate and charge factor input blank', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns the page data for the view', async () => {
          const result = await SubmitAmendedAdjustmentFactorService
            .go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'search',
            pageTitle: 'Set the adjustment factors',
            inputtedAggregateValue: undefined,
            inputtedChargeValue: undefined,
            billRunId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
            licenceId: '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2',
            financialYear: '2022 to 2023',
            chargePeriod: '1 September 2022 to 31 March 2023',
            chargeReference: {
              id: 'e93fa3c6-195f-48eb-a03f-f87db7218f2d',
              description: 'High loss, non-tidal, greater than 50 up to and including 85 ML/yr',
              aggregateFactor: 0.5,
              chargeAdjustment: 0.5,
              otherAdjustments: ''
            }
          }, { skip: ['error'] })
        })

        it('returns the page data with an error for the aggregate and charge factor input element', async () => {
          const result = await SubmitAmendedAdjustmentFactorService
            .go(billRunId, licenceId, reviewChargeReference.id, payload, yarStub)

          expect(result.error).to.equal({
            aggregateFactorElement: { text: 'Enter a aggregate factor' },
            chargeAdjustmentElement: { text: 'Enter a charge factor' }
          })
        })
      })
    })
  })
})

function _amendAdjustmentFactorData () {
  return {
    billRunId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
    licenceId: '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2',
    financialYear: '2022 to 2023',
    chargePeriod: '1 September 2022 to 31 March 2023',
    chargeReference: {
      id: 'e93fa3c6-195f-48eb-a03f-f87db7218f2d',
      description: 'High loss, non-tidal, greater than 50 up to and including 85 ML/yr',
      aggregateFactor: 0.5,
      chargeAdjustment: 0.5,
      otherAdjustments: ''
    }
  }
}

async function _fetchReviewChargeReference (id) {
  return ReviewChargeReferenceModel.query()
    .findById(id)
}
