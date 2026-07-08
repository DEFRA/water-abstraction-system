// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'

// Thing under test
import RemovePresenter from '../../../../app/presenters/bill-runs/review/remove.presenter.js'

describe('Bill Runs Review - Remove presenter', () => {
  let removeReviewLicence

  beforeEach(() => {
    removeReviewLicence = BillRunsReviewFixture.removeReviewLicence()
  })

  describe('when provided with the result of fetch remove review licence service', () => {
    it('correctly presents the data', () => {
      const result = RemovePresenter(removeReviewLicence)

      expect(result).toEqual({
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
