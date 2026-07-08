// Test framework dependencies

// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'
import ReviewLicenceModel from '../../../../app/models/review-licence.model.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import FetchReviewLicenceService from '../../../../app/services/bill-runs/review/fetch-review-licence.service.js'

// Thing under test
import SubmitReviewLicenceService from '../../../../app/services/bill-runs/review/submit-review-licence.service.js'

describe('Bill Runs Review - Submit Review Licence Service', () => {
  let payload
  let patchStub
  let reviewLicence
  let yarStub

  beforeEach(async () => {
    reviewLicence = BillRunsReviewFixture.reviewLicence()

    vi.mock('../../../../app/services/bill-runs/review/fetch-review-licence.service.js')
    FetchReviewLicenceService.mockResolvedValue(reviewLicence)

    patchStub = vi.fn().mockResolvedValue()
    vi.spyOn(ReviewLicenceModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      patch: patchStub
    })

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the user is updating the status', () => {
      beforeEach(() => {
        payload = { 'licence-status': 'ready' }
      })

      it('sets a flash message and updates the status of the review licence', async () => {
        await SubmitReviewLicenceService(reviewLicence.id, yarStub, payload)

        // Check we save the status change
        const [patchObject] = patchStub.mock.calls[0]

        expect(patchObject).toEqual({ status: 'ready' })

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('banner')
        expect(bannerMessage).toEqual('Licence changed to ready.')
      })
    })

    describe('and the user is updating the progress', () => {
      describe('to mark it as "in progress"', () => {
        beforeEach(() => {
          payload = { 'mark-progress': 'mark' }
        })

        it('sets a flash message and updates the progress of the review licence', async () => {
          await SubmitReviewLicenceService(reviewLicence.id, yarStub, payload)

          // Check we save the status change
          const [patchObject] = patchStub.mock.calls[0]

          expect(patchObject).toEqual({ progress: true })

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('banner')
          expect(bannerMessage).toEqual('This licence has been marked.')
        })
      })

      describe('to unmark it', () => {
        beforeEach(() => {
          payload = { 'mark-progress': 'unmark' }
        })

        it('sets a flash message and updates the progress of the review licence', async () => {
          await SubmitReviewLicenceService(reviewLicence.id, yarStub, payload)

          // Check we save the status change
          const [patchObject] = patchStub.mock.calls[0]

          expect(patchObject).toEqual({ progress: false })

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('banner')
          expect(bannerMessage).toEqual('The progress mark for this licence has been removed.')
        })
      })
    })
  })
})
