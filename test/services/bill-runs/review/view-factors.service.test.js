// Test framework dependencies

// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'

// Things we need to stub
import FetchReviewChargeReferenceService from '../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js'

// Thing under test
import ViewFactorsService from '../../../../app/services/bill-runs/review/view-factors.service.js'

describe('Bill Runs - Review - View Factors Service', () => {
  let reviewChargeReference

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    vi.mock('../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js')
    FetchReviewChargeReferenceService.mockResolvedValue(reviewChargeReference)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewFactorsService(reviewChargeReference.id)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        pageTitle: 'Set the adjustment factors',
        amendedAggregate: 0.333333333,
        amendedChargeAdjustment: 1,
        chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
        chargePeriod: '1 April 2023 to 31 March 2024',
        financialPeriod: '2023 to 2024',
        otherAdjustments: ['Two part tariff agreement'],
        reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023'
      })
    })
  })
})
