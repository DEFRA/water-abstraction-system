// Test framework dependencies

// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import FetchReviewChargeReferenceService from '../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js'
import ReviewChargeReferenceModel from '../../../../app/models/review-charge-reference.model.js'

// Thing under test
import SubmitFactorsService from '../../../../app/services/bill-runs/review/submit-factors.service.js'

describe('Bill Runs Review - Submit Factors Service', () => {
  let payload
  let patchStub
  let reviewChargeReference
  let yarStub

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    vi.mock('../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js')
    FetchReviewChargeReferenceService.mockResolvedValue(reviewChargeReference)

    patchStub = vi.fn().mockResolvedValue()
    vi.spyOn(ReviewChargeReferenceModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      patch: patchStub
    })

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = { amendedAggregate: 0.5, amendedChargeAdjustment: 0.5 }
      })

      it('saves the submitted value, adds a flash message and returns an empty object', async () => {
        const result = await SubmitFactorsService(reviewChargeReference.id, yarStub, payload)

        // Check we save the change
        const [patchObject] = patchStub.mock.calls[0]

        expect(patchObject).toEqual({ amendedAggregate: 0.5, amendedChargeAdjustment: 0.5 })

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('banner')
        expect(bannerMessage).toEqual('The adjustment factors for this licence have been updated')

        // Check we return an empty object (controller knows POST was successful so redirects)
        expect(result).toEqual({})
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('does not save the submitted value or add a flash message, and returns the page data including an error', async () => {
        const result = await SubmitFactorsService(reviewChargeReference.id, yarStub, payload)

        // Check we didn't save
        expect(patchStub).not.toHaveBeenCalled()

        // Check we didn't add the flash message
        expect(yarStub.flash).not.toHaveBeenCalled()

        // Check we return page data including error (controller knows POST failed so re-renders)
        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          amendedAggregate: 0.333333333,
          amendedChargeAdjustment: 1,
          error: {
            errorList: [
              { href: '#amended-aggregate', text: 'Enter an aggregate factor' },
              { href: '#amended-charge-adjustment', text: 'Enter a charge factor' }
            ],
            amendedAggregate: { message: 'Enter an aggregate factor' },
            amendedChargeAdjustment: { message: 'Enter a charge factor' }
          },
          pageTitle: 'Set the adjustment factors',
          chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
          chargePeriod: '1 April 2023 to 31 March 2024',
          financialPeriod: '2023 to 2024',
          otherAdjustments: ['Two part tariff agreement'],
          reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023'
        })
      })
    })
  })
})
