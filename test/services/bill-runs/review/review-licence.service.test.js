'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Things we need to stub
const FetchReviewLicenceService = require('../../../../app/services/bill-runs/review/fetch-review-licence.service.js')

// Thing under test
const ReviewLicenceService = require('../../../../app/services/bill-runs/review/review-licence.service.js')

describe('Bill Runs Review - Review Licence Service', () => {
  let reviewLicence

  let yarStub

  beforeEach(() => {
    reviewLicence = BillRunsReviewFixture.reviewLicence()

    Sinon.stub(FetchReviewLicenceService, 'go').resolves(reviewLicence)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and there is a flash message to display', () => {
      beforeEach(() => {
        yarStub = { flash: Sinon.stub().withArgs('banner').returns(['This licence has been marked.']) }
      })

      it('returns page data for the view', async () => {
        const result = await ReviewLicenceService.go(reviewLicence.id, yarStub)

        expect(result).to.equal({
          bannerMessage: 'This licence has been marked.',
          billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
          billRunTitle: 'South West two-part tariff',
          chargeVersions: [
            {
              billingAccountDetails: {
                billingAccountId: 'f041c128-bb4d-4f67-8f97-e33d71d50842',
                accountNumber: 'E99999999A',
                accountName: 'Mr B Blobby Ltd',
                contactName: null,
                addressLines: [
                  'C/O Noel Edmonds',
                  'Crinkley Bottom',
                  'Cricket St Thomas',
                  'Somerset',
                  'TA20 1KL',
                  'United Kingdom'
                ]
              },
              chargePeriod: '1 April 2023 to 31 March 2024',
              chargeReferences: [
                {
                  billableReturnsWarning: false,
                  chargeCategory: 'Charge reference 4.6.5',
                  chargeDescription:
                    'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
                  id: '6c70461b-3f83-47b1-9538-8305e82b34eb',
                  chargeElements: [
                    {
                      billableReturns: '0 ML / 9.092 ML',
                      chargePeriods: ['1 April 2023 to 30 September 2023'],
                      returnVolumes: ['0 ML (10030495)'],
                      description: 'Spray Irrigation - Direct',
                      elementCount: 1,
                      elementIndex: 1,
                      status: 'review',
                      id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
                      issues: ['Aggregate'],
                      purpose: 'Spray Irrigation - Direct'
                    }
                  ],
                  chargeReferenceLinkTitle: 'Change details',
                  totalBillableReturns: '0 ML / 9.092 ML'
                }
              ],
              description: '1 charge reference with 1 two-part tariff charge element',
              financialPeriod: '2023 to 2024'
            }
          ],
          elementsInReview: true,
          licenceHolder: 'Licence Holder Ltd',
          licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
          licenceRef: '1/11/11/*11/1111',
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
          pageTitle: 'Licence 1/11/11/*11/1111',
          progress: false,
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          status: 'review',
          unmatchedReturns: [
            {
              abstractionPeriod: '1 April to 30 September',
              description: 'Lost Road. Points 1 and 2.',
              issues: [],
              purpose: 'Spray Irrigation - Storage',
              reference: '11142961',
              returnId: 'v1:5:1/11/11/*11/1111:11142961:2022-11-01:2023-10-31',
              returnLink: '/returns/return?id=v1:5:1/11/11/*11/1111:11142961:2022-11-01:2023-10-31',
              returnPeriod: '1 November 2022 to 31 October 2023',
              returnStatus: 'completed',
              returnTotal: '0 ML / 0 ML'
            }
          ]
        })
      })
    })

    describe('and there is no flash message to display', () => {
      beforeEach(() => {
        yarStub = { flash: Sinon.stub().withArgs('banner').returns([undefined]) }
      })

      it('returns page data for the view', async () => {
        const result = await ReviewLicenceService.go(reviewLicence.id, yarStub)

        expect(result).to.equal({
          bannerMessage: undefined,
          billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
          billRunTitle: 'South West two-part tariff',
          chargeVersions: [
            {
              billingAccountDetails: {
                billingAccountId: 'f041c128-bb4d-4f67-8f97-e33d71d50842',
                accountNumber: 'E99999999A',
                accountName: 'Mr B Blobby Ltd',
                contactName: null,
                addressLines: [
                  'C/O Noel Edmonds',
                  'Crinkley Bottom',
                  'Cricket St Thomas',
                  'Somerset',
                  'TA20 1KL',
                  'United Kingdom'
                ]
              },
              chargePeriod: '1 April 2023 to 31 March 2024',
              chargeReferences: [
                {
                  billableReturnsWarning: false,
                  chargeCategory: 'Charge reference 4.6.5',
                  chargeDescription:
                    'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
                  id: '6c70461b-3f83-47b1-9538-8305e82b34eb',
                  chargeElements: [
                    {
                      billableReturns: '0 ML / 9.092 ML',
                      chargePeriods: ['1 April 2023 to 30 September 2023'],
                      returnVolumes: ['0 ML (10030495)'],
                      description: 'Spray Irrigation - Direct',
                      elementCount: 1,
                      elementIndex: 1,
                      status: 'review',
                      id: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
                      issues: ['Aggregate'],
                      purpose: 'Spray Irrigation - Direct'
                    }
                  ],
                  chargeReferenceLinkTitle: 'Change details',
                  totalBillableReturns: '0 ML / 9.092 ML'
                }
              ],
              description: '1 charge reference with 1 two-part tariff charge element',
              financialPeriod: '2023 to 2024'
            }
          ],
          elementsInReview: true,
          licenceHolder: 'Licence Holder Ltd',
          licenceId: '32416c67-f755-4c3f-8816-ecde0ee596bd',
          licenceRef: '1/11/11/*11/1111',
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
          pageTitle: 'Licence 1/11/11/*11/1111',
          progress: false,
          reviewLicenceId: 'bb779166-0576-4581-b504-edbc0227d763',
          status: 'review',
          unmatchedReturns: [
            {
              abstractionPeriod: '1 April to 30 September',
              description: 'Lost Road. Points 1 and 2.',
              issues: [],
              purpose: 'Spray Irrigation - Storage',
              reference: '11142961',
              returnId: 'v1:5:1/11/11/*11/1111:11142961:2022-11-01:2023-10-31',
              returnLink: '/returns/return?id=v1:5:1/11/11/*11/1111:11142961:2022-11-01:2023-10-31',
              returnPeriod: '1 November 2022 to 31 October 2023',
              returnStatus: 'completed',
              returnTotal: '0 ML / 0 ML'
            }
          ]
        })
      })
    })
  })
})
