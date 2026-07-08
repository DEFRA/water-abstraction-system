// Test framework dependencies

// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import CreateLicenceSupplementaryYearService from '../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js'
import FetchRemoveReviewLicenceService from '../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js'
import ProcessBillRunPostRemove from '../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js'
import RemoveReviewLicenceService from '../../../../app/services/bill-runs/review/remove-review-licence.service.js'
import UnassignLicencesToBillRunService from '../../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js'

// Thing under test
import SubmitRemoveService from '../../../../app/services/bill-runs/review/submit-remove.service.js'

describe('Bill Runs - Review - Submit Remove service', () => {
  let removeReviewLicence
  let yarStub

  beforeEach(() => {
    removeReviewLicence = BillRunsReviewFixture.removeReviewLicence()

    vi.mock('../../../../app/services/bill-runs/review/remove-review-licence.service.js')
    RemoveReviewLicenceService.mockResolvedValue()

    vi.mock('../../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js')
    UnassignLicencesToBillRunService.mockResolvedValue()

    vi.mock('../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js')
      .withArgs(removeReviewLicence.licenceId, [removeReviewLicence.billRun.toFinancialYearEnding], true)
      .resolves()

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the bill run is two-part tariff annual', () => {
      describe('and this is not the last licence in the bill run', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js')
          FetchRemoveReviewLicenceService.mockResolvedValue(removeReviewLicence)
          vi.mock('../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js')
          ProcessBillRunPostRemove.mockResolvedValue(false)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(RemoveReviewLicenceService).toHaveBeenCalled()
        })

        it('does not attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(UnassignLicencesToBillRunService).not.toHaveBeenCalled()
        })

        it('flags the licence for supplementary billing', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(CreateLicenceSupplementaryYearService).toHaveBeenCalled()
        })

        it('sets a notification', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(yarStub.flash).toHaveBeenCalled()

          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({
            titleText: 'Licence removed',
            text: 'Licence 1/11/11/*11/1111 removed from the bill run.'
          })
        })

        it('returns the bill run ID and a flag to indicate the bill run is not empty', async () => {
          const result = await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(result).toEqual({
            billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            empty: false
          })
        })
      })

      describe('and this is the last licence in the bill run', () => {
        beforeEach(() => {
          vi.mock('../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js')
          FetchRemoveReviewLicenceService.mockResolvedValue(removeReviewLicence)
          vi.mock('../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js')
          ProcessBillRunPostRemove.mockResolvedValue(true)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(RemoveReviewLicenceService).toHaveBeenCalled()
        })

        it('does not attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(UnassignLicencesToBillRunService).not.toHaveBeenCalled()
        })

        it('flags the licence for supplementary billing', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(CreateLicenceSupplementaryYearService).toHaveBeenCalled()
        })

        it('does not add a flash message', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(yarStub.flash).not.toHaveBeenCalled()
        })

        it('returns the bill run ID and a flag to indicate the bill run is empty', async () => {
          const result = await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(result).toEqual({
            billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            empty: true
          })
        })
      })
    })

    describe('and the bill run is for two-part tariff supplementary', () => {
      describe('and this is not the last licence in the bill run', () => {
        beforeEach(() => {
          removeReviewLicence.billRun.batchType = 'two_part_supplementary'
          vi.mock('../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js')
          FetchRemoveReviewLicenceService.mockResolvedValue(removeReviewLicence)
          vi.mock('../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js')
          ProcessBillRunPostRemove.mockResolvedValue(false)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(RemoveReviewLicenceService).toHaveBeenCalled()
        })

        it('does attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(UnassignLicencesToBillRunService).toHaveBeenCalled()
        })

        it('does not flag the licence for supplementary billing', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(CreateLicenceSupplementaryYearService).not.toHaveBeenCalled()
        })

        it('sets a notification', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(yarStub.flash).toHaveBeenCalled()

          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({
            titleText: 'Licence removed',
            text: 'Licence 1/11/11/*11/1111 removed from the bill run.'
          })
        })

        it('returns the bill run ID and a flag to indicate the bill run is not empty', async () => {
          const result = await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(result).toEqual({
            billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            empty: false
          })
        })
      })

      describe('and this is the last licence in the bill run', () => {
        beforeEach(() => {
          removeReviewLicence.billRun.batchType = 'two_part_supplementary'
          vi.mock('../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js')
          FetchRemoveReviewLicenceService.mockResolvedValue(removeReviewLicence)
          vi.mock('../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js')
          ProcessBillRunPostRemove.mockResolvedValue(true)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(RemoveReviewLicenceService).toHaveBeenCalled()
        })

        it('does attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(UnassignLicencesToBillRunService).toHaveBeenCalled()
        })

        it('does not flag the licence for supplementary billing', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(CreateLicenceSupplementaryYearService).not.toHaveBeenCalled()
        })

        it('does not add a flash message', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(yarStub.flash).not.toHaveBeenCalled()
        })

        it('returns the bill run ID and a flag to indicate the bill run is empty', async () => {
          const result = await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(result).toEqual({
            billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            empty: true
          })
        })
      })
    })
  })
})
