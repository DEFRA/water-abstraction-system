'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Things we need to stub
const FetchReviewChargeElementService = require('../../../../app/services/bill-runs/review/fetch-review-charge-element.service.js')

// Thing under test
const ReviewChargeElementService = require('../../../../app/services/bill-runs/review/review-charge-element.service.js')

describe('Bill Runs Review - Review Charge Element Service', () => {
  const elementIndex = 1

  let reviewChargeElement
  let yarStub

  beforeEach(() => {
    reviewChargeElement = BillRunsReviewFixture.reviewChargeElement()

    Sinon.stub(FetchReviewChargeElementService, 'go').resolves(reviewChargeElement)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and there is a flash message to display', () => {
      beforeEach(() => {
        yarStub = {
          flash: Sinon.stub().withArgs('banner').returns(['The billable returns for this licence have been updated'])
        }
      })

      it('returns page data for the view', async () => {
        const result = await ReviewChargeElementService.go(reviewChargeElement.id, elementIndex, yarStub)

        expect(result).to.equal({
          activeNavBar: 'bill-runs',
          bannerMessage: 'The billable returns for this licence have been updated',
          pageTitle: 'Review charge element',
          authorisedVolume: 9.092,
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
              returnId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
              returnLink: '/returns/return?id=v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
              returnPeriod: '1 November 2022 to 31 October 2023',
              returnStatus: 'completed',
              returnTotal: '0 ML / 0 ML'
            }
          ],
          reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          status: 'review'
        })
      })
    })

    describe('and there is no flash message to display', () => {
      beforeEach(() => {
        yarStub = { flash: Sinon.stub().withArgs('banner').returns([undefined]) }
      })

      it('returns page data for the view', async () => {
        const result = await ReviewChargeElementService.go(reviewChargeElement.id, elementIndex, yarStub)

        expect(result).to.equal({
          activeNavBar: 'bill-runs',
          bannerMessage: undefined,
          pageTitle: 'Review charge element',
          authorisedVolume: 9.092,
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
              returnId: 'v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
              returnLink: '/returns/return?id=v1:5:1/11/11/*11/1111:11142960:2022-11-01:2023-10-31',
              returnPeriod: '1 November 2022 to 31 October 2023',
              returnStatus: 'completed',
              returnTotal: '0 ML / 0 ML'
            }
          ],
          reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          status: 'review'
        })
      })
    })
  })
})
