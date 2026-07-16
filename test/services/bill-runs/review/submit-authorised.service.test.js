// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchReviewChargeReferenceService from '../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js'
import ReviewChargeReferenceModel from '../../../../app/models/review-charge-reference.model.js'

// Thing under test
import SubmitAuthorisedService from '../../../../app/services/bill-runs/review/submit-authorised.service.js'

describe('Bill Runs Review - Submit Authorised Service', () => {
  let payload
  let patchStub
  let reviewChargeReference
  let yarStub

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    vi.spyOn(FetchReviewChargeReferenceService, 'default').mockResolvedValue(reviewChargeReference)

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
        payload = { amendedAuthorisedVolume: '9.092', totalBillableReturns: '9.092' }
      })

      it('saves the submitted value, adds a flash message and returns an empty object', async () => {
        const result = await SubmitAuthorisedService(reviewChargeReference.id, yarStub, payload)

        // Check we save the change
        const [patchObject] = patchStub.mock.calls[0]

        expect(patchObject).toEqual({ amendedAuthorisedVolume: '9.092' })

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('banner')
        expect(bannerMessage).toEqual('The authorised volume for this licence have been updated')

        // Check we return an empty object (controller knows POST was successful so redirects)
        expect(result).toEqual({})
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = { amendedAuthorisedVolume: '-1', totalBillableReturns: '9.092' }
      })

      it('does not save the submitted value or add a flash message, and returns the page data including an error', async () => {
        const result = await SubmitAuthorisedService(reviewChargeReference.id, yarStub, payload)

        // Check we didn't save
        expect(patchStub).not.toHaveBeenCalled()

        // Check we didn't add the flash message
        expect(yarStub.flash).not.toHaveBeenCalled()

        // Check we return page data including error (controller knows POST failed so re-renders)
        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          amendedAuthorisedVolume: 9.092,
          error: { text: 'The authorised volume must be greater than 9.092' },
          pageTitle: 'Set the authorised volume',
          chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
          chargePeriod: '1 April 2023 to 31 March 2024',
          financialPeriod: '2023 to 2024',
          reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
          totalBillableReturns: 0
        })
      })
    })
  })
})
