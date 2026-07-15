// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'

// Things we need to stub
import * as FetchRemoveReviewLicenceService from '../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js'

// Thing under test
import ViewRemoveService from '../../../../app/services/bill-runs/review/view-remove.service.js'

describe('Bill Runs - Review - View Remove service', () => {
  let removeReviewLicence

  beforeEach(() => {
    removeReviewLicence = BillRunsReviewFixture.removeReviewLicence()

    vi.spyOn(FetchRemoveReviewLicenceService, 'default').mockResolvedValue(removeReviewLicence)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewRemoveService(removeReviewLicence.id)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        billRunNumber: 10001,
        billRunStatus: 'review',
        dateCreated: '22 October 2024',
        financialYearPeriod: '2023 to 2024',
        pageTitle: "You're about to remove 1/11/11/*11/1111 from the bill run",
        region: 'Test Region',
        reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763'
      })
    })
  })
})
