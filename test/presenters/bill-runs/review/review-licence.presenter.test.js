'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Thing under test
const ReviewLicencePresenter = require('../../../../app/presenters/bill-runs/review/review-licence.presenter.js')

describe('Bill Runs Review - Review Licence presenter', () => {
  let reviewLicence

  beforeEach(() => {
    reviewLicence = BillRunsReviewFixture.reviewLicence()
  })

  describe('when provided with the result of fetch review licence service', () => {
    it('correctly presents the data', async () => {
      const result = ReviewLicencePresenter.go(reviewLicence)

      expect(result).to.equal({
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
                chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
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

    describe('the "chargeVersions" property', () => {
      describe('the "chargeReferences" property', () => {
        describe('the "chargeReferenceLinkTitle" property', () => {
          describe('when a review charge reference has an aggregate (not equal to 1)', () => {
            beforeEach(() => {
              reviewLicence.reviewChargeVersions[0].reviewChargeReferences[0].aggregate = 0.5
              reviewLicence.reviewChargeVersions[0].reviewChargeReferences[0].chargeAdjustment = 1
            })

            it('returns "Change details"', () => {
              const result = ReviewLicencePresenter.go(reviewLicence)

              expect(result.chargeVersions[0].chargeReferences[0].chargeReferenceLinkTitle).to.equal('Change details')
            })
          })

          describe('when a review charge reference has a chargeAdjustment (not equal to 1)', () => {
            beforeEach(() => {
              reviewLicence.reviewChargeVersions[0].reviewChargeReferences[0].aggregate = 1
              reviewLicence.reviewChargeVersions[0].reviewChargeReferences[0].chargeAdjustment = 0.5
            })

            it('returns "Change details"', () => {
              const result = ReviewLicencePresenter.go(reviewLicence)

              expect(result.chargeVersions[0].chargeReferences[0].chargeReferenceLinkTitle).to.equal('Change details')
            })
          })

          describe('when a review charge reference neither an aggregate or charge adjustment (both equal 1)', () => {
            beforeEach(() => {
              reviewLicence.reviewChargeVersions[0].reviewChargeReferences[0].aggregate = 1
              reviewLicence.reviewChargeVersions[0].reviewChargeReferences[0].chargeAdjustment = 1
            })

            it('returns "View details"', () => {
              const result = ReviewLicencePresenter.go(reviewLicence)

              expect(result.chargeVersions[0].chargeReferences[0].chargeReferenceLinkTitle).to.equal('View details')
            })
          })
        })

        describe('the "billableReturnsWarning" property', () => {
          describe("when the sum allocated to a charge reference's charge elements is less than its authorised volume", () => {
            it('returns false', () => {
              const result = ReviewLicencePresenter.go(reviewLicence)

              expect(result.chargeVersions[0].chargeReferences[0].billableReturnsWarning).to.equal(false)
            })
          })

          describe("when the sum allocated to a charge reference's charge elements equal to its authorised volume", () => {
            beforeEach(() => {
              reviewLicence.reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].amendedAllocated = 9.092
            })

            it('returns false', () => {
              const result = ReviewLicencePresenter.go(reviewLicence)

              expect(result.chargeVersions[0].chargeReferences[0].billableReturnsWarning).to.equal(false)
            })
          })

          describe("when the sum allocated to a charge reference's charge elements is greater than its authorised volume", () => {
            beforeEach(() => {
              reviewLicence.reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].amendedAllocated = 10
            })

            it('returns true', () => {
              const result = ReviewLicencePresenter.go(reviewLicence)

              expect(result.chargeVersions[0].chargeReferences[0].billableReturnsWarning).to.equal(true)
            })
          })
        })
      })
    })
  })
})
