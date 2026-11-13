// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import BillRunsReviewFixture from '../../../support/fixtures/bill-runs-review.fixture.js'

// Things we need to stub
import * as FetchReviewChargeElementDal from '../../../../src/dal/bill-runs/review/fetch-review-charge-element.dal.js'

// Thing under test
import ViewReviewChargeElementService from '../../../../src/services/bill-runs/review/view-review-charge-element.service.js'

describe('Bill Runs - Review - View Review Charge Element Service', () => {
  const elementIndex = 1

  let reviewChargeElement
  let yarStub

  beforeEach(() => {
    reviewChargeElement = BillRunsReviewFixture.reviewChargeElement()

    vi.spyOn(FetchReviewChargeElementDal, 'default').mockResolvedValue(reviewChargeElement)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and there is a flash message to display', () => {
      beforeEach(() => {
        yarStub = YarStub()
        yarStub.flash.mockReturnValue(['The billable returns for this licence have been updated'])
      })

      it('returns page data for the view', async () => {
        const result = await ViewReviewChargeElementService(reviewChargeElement.id, elementIndex, yarStub)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          authorisedVolume: 9.092,
          bannerMessage: 'The billable returns for this licence have been updated',
          billableReturns: 0,
          chargeDescription: 'Spray Irrigation - Direct',
          chargePeriod: '1 April 2023 to 31 March 2024',
          chargePeriods: ['1 April 2023 to 30 September 2023'],
          elementCount: 1,
          elementIndex: 1,
          financialPeriod: '2023 to 2024',
          issues: ['Aggregate'],
          licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
          matchedReturns: [
            {
              abstractionPeriod: '1 April to 30 September',
              description: 'Test Road. Points 1 and 2.',
              issues: [],
              purpose: 'Spray Irrigation - Direct',
              reference: '11142960',
              returnLink: '/system/return-logs/e0e3957d-ab75-4a49-bb04-36a332053448/details',
              returnPeriod: '1 November 2022 to 31 October 2023',
              returnStatus: 'completed',
              returnTotal: '0 ML / 0 ML'
            }
          ],
          pageTitle: 'Review charge element',
          reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          status: 'review'
        })
      })
    })

    describe('and there is no flash message to display', () => {
      beforeEach(() => {
        yarStub = YarStub()
        yarStub.flash.mockReturnValue([undefined])
      })

      it('returns page data for the view', async () => {
        const result = await ViewReviewChargeElementService(reviewChargeElement.id, elementIndex, yarStub)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          authorisedVolume: 9.092,
          bannerMessage: undefined,
          billableReturns: 0,
          chargeDescription: 'Spray Irrigation - Direct',
          chargePeriod: '1 April 2023 to 31 March 2024',
          chargePeriods: ['1 April 2023 to 30 September 2023'],
          elementCount: 1,
          elementIndex: 1,
          financialPeriod: '2023 to 2024',
          issues: ['Aggregate'],
          licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
          matchedReturns: [
            {
              abstractionPeriod: '1 April to 30 September',
              description: 'Test Road. Points 1 and 2.',
              issues: [],
              purpose: 'Spray Irrigation - Direct',
              reference: '11142960',
              returnLink: '/system/return-logs/e0e3957d-ab75-4a49-bb04-36a332053448/details',
              returnPeriod: '1 November 2022 to 31 October 2023',
              returnStatus: 'completed',
              returnTotal: '0 ML / 0 ML'
            }
          ],
          pageTitle: 'Review charge element',
          reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          status: 'review'
        })
      })
    })
  })
})
