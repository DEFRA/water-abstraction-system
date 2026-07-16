// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'

// Things we need to stub
import * as FetchReviewChargeReferenceService from '../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js'

// Thing under test
import ViewAuthorisedService from '../../../../app/services/bill-runs/review/view-authorised.service.js'

describe('Bill Runs - Review - View Authorised Service', () => {
  let reviewChargeReference

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    vi.spyOn(FetchReviewChargeReferenceService, 'default').mockResolvedValue(reviewChargeReference)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAuthorisedService(reviewChargeReference.id)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        pageTitle: 'Set the authorised volume',
        amendedAuthorisedVolume: 9.092,
        chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
        chargePeriod: '1 April 2023 to 31 March 2024',
        financialPeriod: '2023 to 2024',
        reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
        totalBillableReturns: 0
      })
    })
  })
})
