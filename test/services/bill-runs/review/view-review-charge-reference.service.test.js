// Test framework dependencies

// Test helpers
import * as BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchReviewChargeReferenceService from '../../../../app/services/bill-runs/review/fetch-review-charge-reference.service.js'

// Thing under test
import ViewReviewChargeReferenceService from '../../../../app/services/bill-runs/review/view-review-charge-reference.service.js'

describe('Bill Runs - Review - View Review Charge Reference Service', () => {
  let reviewChargeReference
  let yarStub

  beforeEach(() => {
    reviewChargeReference = BillRunsReviewFixture.reviewChargeReference()

    vi.spyOn(FetchReviewChargeReferenceService, 'default').mockResolvedValue(reviewChargeReference)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and there is a banner flash message to display', () => {
      beforeEach(() => {
        const stub = vi.fn()

        stub.mockReturnValueOnce(['The authorised volume for this licence have been updated'])
        stub.mockReturnValueOnce([undefined])

        yarStub = YarStub()
        yarStub.flash = stub
      })

      it('returns page data for the view', async () => {
        const result = await ViewReviewChargeReferenceService(reviewChargeReference.id, yarStub)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          pageTitle: 'Review charge reference',
          bannerMessage: 'The authorised volume for this licence have been updated',
          chargeMessage: undefined,
          additionalCharges: '',
          adjustments: [
            'Aggregate factor (0.333333333 / 0.333333333)',
            'Charge adjustment (1 / 1)',
            'Two part tariff agreement'
          ],
          amendedAuthorisedVolume: 9.092,
          canAmend: true,
          chargeCategory: '4.6.5',
          chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
          chargePeriod: '1 April 2023 to 31 March 2024',
          financialPeriod: '2023 to 2024',
          reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          totalBillableReturns: 0
        })
      })
    })

    describe('and there is a charge flash message to display', () => {
      beforeEach(() => {
        const stub = vi.fn()

        stub.mockReturnValueOnce([undefined])
        stub.mockReturnValueOnce(['Based on this information the example charge is £256.48.'])

        yarStub = YarStub()
        yarStub.flash = stub
      })

      it('returns page data for the view', async () => {
        const result = await ViewReviewChargeReferenceService(reviewChargeReference.id, yarStub)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          pageTitle: 'Review charge reference',
          bannerMessage: undefined,
          chargeMessage: 'Based on this information the example charge is £256.48.',
          additionalCharges: '',
          adjustments: [
            'Aggregate factor (0.333333333 / 0.333333333)',
            'Charge adjustment (1 / 1)',
            'Two part tariff agreement'
          ],
          amendedAuthorisedVolume: 9.092,
          canAmend: true,
          chargeCategory: '4.6.5',
          chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
          chargePeriod: '1 April 2023 to 31 March 2024',
          financialPeriod: '2023 to 2024',
          reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          totalBillableReturns: 0
        })
      })
    })

    describe('and there is no flash message to display', () => {
      beforeEach(() => {
        const stub = vi.fn()

        stub.mockReturnValue([undefined])
        stub.mockReturnValue([undefined])

        yarStub = YarStub()
        yarStub.flash = stub
      })

      it('returns page data for the view', async () => {
        const result = await ViewReviewChargeReferenceService(reviewChargeReference.id, yarStub)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          pageTitle: 'Review charge reference',
          bannerMessage: undefined,
          chargeMessage: undefined,
          additionalCharges: '',
          adjustments: [
            'Aggregate factor (0.333333333 / 0.333333333)',
            'Charge adjustment (1 / 1)',
            'Two part tariff agreement'
          ],
          amendedAuthorisedVolume: 9.092,
          canAmend: true,
          chargeCategory: '4.6.5',
          chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
          chargePeriod: '1 April 2023 to 31 March 2024',
          financialPeriod: '2023 to 2024',
          reviewChargeReferenceId: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          totalBillableReturns: 0
        })
      })
    })
  })
})
