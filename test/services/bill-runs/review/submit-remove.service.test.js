// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as CreateLicenceSupplementaryYearService from '../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js'
import * as FetchRemoveReviewLicenceService from '../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js'
import * as ProcessBillRunPostRemove from '../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js'
import * as RemoveReviewLicenceService from '../../../../app/services/bill-runs/review/remove-review-licence.service.js'
import * as UnassignLicencesToBillRunService from '../../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js'

// Thing under test
import SubmitRemoveService from '../../../../app/services/bill-runs/review/submit-remove.service.js'

describe('Bill Runs - Review - Submit Remove service', () => {
  let removeReviewLicence
  let yarStub

  beforeEach(() => {
    removeReviewLicence = BillRunsReviewFixture.removeReviewLicence()

    vi.spyOn(RemoveReviewLicenceService, 'default').mockResolvedValue()

    vi.spyOn(UnassignLicencesToBillRunService, 'default').mockResolvedValue()

    yarStub = YarStub()
    vi.spyOn(CreateLicenceSupplementaryYearService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the bill run is two-part tariff annual', () => {
      describe('and this is not the last licence in the bill run', () => {
        beforeEach(() => {
          vi.spyOn(FetchRemoveReviewLicenceService, 'default').mockResolvedValue(removeReviewLicence)
          vi.spyOn(ProcessBillRunPostRemove, 'default').mockResolvedValue(false)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(RemoveReviewLicenceService.default).toHaveBeenCalled()
        })

        it('does not attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(UnassignLicencesToBillRunService.default).not.toHaveBeenCalled()
        })

        it('flags the licence for supplementary billing', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(CreateLicenceSupplementaryYearService.default).toHaveBeenCalled()
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
          vi.spyOn(FetchRemoveReviewLicenceService, 'default').mockResolvedValue(removeReviewLicence)
          vi.spyOn(ProcessBillRunPostRemove, 'default').mockResolvedValue(true)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(RemoveReviewLicenceService.default).toHaveBeenCalled()
        })

        it('does not attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(UnassignLicencesToBillRunService.default).not.toHaveBeenCalled()
        })

        it('flags the licence for supplementary billing', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(CreateLicenceSupplementaryYearService.default).toHaveBeenCalled()
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
          vi.spyOn(FetchRemoveReviewLicenceService, 'default').mockResolvedValue(removeReviewLicence)
          vi.spyOn(ProcessBillRunPostRemove, 'default').mockResolvedValue(false)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(RemoveReviewLicenceService.default).toHaveBeenCalled()
        })

        it('does attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(UnassignLicencesToBillRunService.default).toHaveBeenCalled()
        })

        it('does not flag the licence for supplementary billing', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(CreateLicenceSupplementaryYearService.default).not.toHaveBeenCalled()
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
          vi.spyOn(FetchRemoveReviewLicenceService, 'default').mockResolvedValue(removeReviewLicence)
          vi.spyOn(ProcessBillRunPostRemove, 'default').mockResolvedValue(true)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(RemoveReviewLicenceService.default).toHaveBeenCalled()
        })

        it('does attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(UnassignLicencesToBillRunService.default).toHaveBeenCalled()
        })

        it('does not flag the licence for supplementary billing', async () => {
          await SubmitRemoveService(removeReviewLicence.id, yarStub)

          expect(CreateLicenceSupplementaryYearService.default).not.toHaveBeenCalled()
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
