// Test framework dependencies

// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'

// Things we need to stub
import FetchReviewChargeElementService from '../../../../app/services/bill-runs/review/fetch-review-charge-element.service.js'

// Thing under test
import ViewEditService from '../../../../app/services/bill-runs/review/view-edit.service.js'

describe('Bill Runs - Review - View Edit Service', () => {
  const elementIndex = 1

  let reviewChargeElement

  beforeEach(() => {
    reviewChargeElement = BillRunsReviewFixture.reviewChargeElement()

    vi.mock('../../../../app/services/bill-runs/review/fetch-review-charge-element.service.js')
    FetchReviewChargeElementService.mockResolvedValue(reviewChargeElement)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewEditService(reviewChargeElement.id, elementIndex)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        pageTitle: 'Set the billable returns quantity for this bill run',
        authorisedQuantity: 9.092,
        billableReturns: 0,
        chargeDescription: 'Spray Irrigation - Direct',
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargePeriods: ['1 April 2023 to 30 September 2023'],
        elementIndex: 1,
        financialPeriod: '2023 to 2024',
        reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
      })
    })
  })
})
