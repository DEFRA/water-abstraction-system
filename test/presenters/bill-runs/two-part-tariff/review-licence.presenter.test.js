'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountModel = require('../../../../app/models/billing-account.model.js')

// Thing under test
const ReviewLicencePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-licence.presenter.js')

describe('Review Licence presenter', () => {
  let billRun
  let licence

  describe('when there is data to be presented for the review licence page', () => {
    beforeEach(() => {
      billRun = _billRun()
      licence = _licenceData()
    })

    it('correctly presents the data', async () => {
      const result = ReviewLicencePresenter.go(billRun, licence)

      expect(result).to.equal({
        billRunId: '6620135b-0ecf-4fd4-924e-371f950c0526',
        region: 'Anglian',
        licence: {
          licenceId: '786f0d83-eaf7-43c3-9de5-ec59e3de05ee',
          licenceRef: '01/49/80/4608',
          progress: false,
          status: 'ready',
          licenceHolder: 'Licence Holder Ltd'
        },
        elementsInReview: false,
        matchedReturns: [
          {
            returnId: 'v1:1:01/60/28/3437:17061181:2022-04-01:2023-03-31',
            reference: '10031343',
            dates: '1 April 2022 to 6 May 2022',
            returnStatus: 'completed',
            description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
            purpose: 'Site description',
            returnTotal: '0 ML / 0 ML',
            issues: [''],
            returnLink: '/returns/return?id=v1:1:01/60/28/3437:17061181:2022-04-01:2023-03-31',
            absPeriod: '1 April to 31 March'
          }
        ],
        unmatchedReturns: [
          {
            dates: '1 April 2022 to 6 May 2022',
            description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
            issues: [''],
            purpose: 'Site description',
            reference: '10031343',
            returnId: 'v2:1:01/60/28/3437:17061181:2022-04-01:2023-03-31',
            returnLink: '/returns/return?id=v2:1:01/60/28/3437:17061181:2022-04-01:2023-03-31',
            returnStatus: 'completed',
            returnTotal: '0 / 0 ML',
            absPeriod: '1 April to 31 March'
          }
        ],
        chargeData: [
          {
            financialYear: '2022 to 2023',
            chargePeriodDate: '1 April 2022 to 5 June 2022',
            chargeElementCount: 1,
            billingAccountDetails: {
              billingAccountId: 'a17ae69b-8074-4d27-80bf-074f4c79a05a',
              accountNumber: 'E88896464A',
              accountName: 'Furland Farm',
              contactName: null,
              addressLines: [
                'Furland Farm',
                'Furland',
                'Crewkerne',
                'Somerset',
                'TA18 7TT',
                'England'
              ]
            },
            chargeReferences: [
              {
                chargeCategory: 'Charge reference 4.6.7',
                chargeDescription: 'High loss, non-tidal, greater than 15 up to and including 50 ML/yr',
                totalBillableReturns: '0 ML / 200 ML',
                billableReturnsWarning: false,
                id: 'b2af5935-4b65-4dce-9f75-9073798f6375',
                chargeReferenceLink: { linkName: 'View details' },
                chargeElements: [
                  {
                    elementNumber: 'Element 1 of 1',
                    elementStatus: 'ready',
                    elementDescription: 'Trickle Irrigation - Direct',
                    dates: ['1 April 2022 to 5 June 2022'],
                    purpose: 'Make-up or top up water',
                    issues: [''],
                    billableReturns: '0 ML / 200 ML',
                    returnVolume: ['0 ML (10031343)'],
                    reviewChargeElementId: '8bc0cd32-400e-4a45-9dd7-fbce3d486031'
                  }
                ]
              }
            ]
          }
        ]
      })
    })

    describe('the "issues" property', () => {
      describe('when the charge element has multiple issues', () => {
        beforeEach(() => {
          licence[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].issues = 'Over abstraction, no returns'
        })

        it('correctly splits the issues into an array', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.chargeData[0].chargeReferences[0].chargeElements[0].issues).to.equal(['Over abstraction', 'no returns'])
        })
      })

      describe('when the matched returns has multiple issues', () => {
        beforeEach(() => {
          licence[0].reviewReturns[0].issues = 'Over abstraction, no returns'
        })

        it('correctly splits the issues into an array', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.matchedReturns[0].issues).to.equal(['Over abstraction', 'no returns'])
        })
      })

      describe('when the unmatched returns has multiple issues', () => {
        beforeEach(() => {
          licence[0].reviewReturns[1].issues = 'Over abstraction, no returns'
        })

        it('correctly splits the issues into an array', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.unmatchedReturns[0].issues).to.equal(['Over abstraction', 'no returns'])
        })
      })
    })

    describe('the "returnStatus" property', () => {
      describe('when a return has a status of "due"', () => {
        beforeEach(() => {
          licence[0].reviewReturns[0].returnStatus = 'due'
          licence[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns[0].returnStatus = 'due'
        })

        it('changes the status text to "overdue"', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.matchedReturns[0].returnStatus).to.equal('overdue')
        })

        it('formats the returns total correctly', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.matchedReturns[0].returnTotal).to.equal('/')
        })

        it('formats the charge elements return total correctly', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.chargeData[0].chargeReferences[0].chargeElements[0].returnVolume).to.equal(['overdue (10031343)'])
        })

        it('formats the returns link correctly', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.matchedReturns[0].returnLink).to.equal('/return/internal?returnId=v1:1:01/60/28/3437:17061181:2022-04-01:2023-03-31')
        })
      })
    })

    describe('the "underQuery" property', () => {
      describe('when a return is under query', () => {
        beforeEach(() => {
          licence[0].reviewReturns[0].underQuery = true
        })

        it('changes the returns status to be "under query"', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.matchedReturns[0].returnStatus).to.equal('query')
        })
      })
    })

    describe('the "adjustment" properties', () => {
      describe('when a review charge reference has an aggregate', () => {
        beforeEach(() => {
          licence[0].reviewChargeVersions[0].reviewChargeReferences[0].aggregate = 0.5
        })

        it('changes the chargeReferenceLink to "Change details"', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.chargeData[0].chargeReferences[0].chargeReferenceLink.linkName).to.equal('Change details')
        })
      })

      describe('when a review charge reference has a charge factor adjustment', () => {
        beforeEach(() => {
          licence[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeAdjustment = 0.5
        })

        it('changes the chargeReferenceLink to "Change details"', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.chargeData[0].chargeReferences[0].chargeReferenceLink.linkName).to.equal('Change details')
        })
      })

      describe('when a review charge reference has an aggregate and charge factor adjustment', () => {
        beforeEach(() => {
          licence[0].reviewChargeVersions[0].reviewChargeReferences[0].aggregate = 0.5
          licence[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeAdjustment = 0.5
        })

        it('changes the chargeReferenceLink to "Change details"', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.chargeData[0].chargeReferences[0].chargeReferenceLink.linkName).to.equal('Change details')
        })
      })

      describe('when a review charge reference does not have an aggregate or charge factor adjustment', () => {
        it('changes the chargeReferenceLink to "View details"', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.chargeData[0].chargeReferences[0].chargeReferenceLink.linkName).to.equal('View details')
        })
      })
    })

    describe('the "billableReturnsWarning" property', () => {
      describe('when a review charge reference has an authorised volume greater than the sum of its charge element quantities', () => {
        it('sets the "billableReturnsWarning" to false', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.chargeData[0].chargeReferences[0].billableReturnsWarning).to.equal(false)
        })
      })

      describe('when a review charge reference has an authorised volume less than the sum of its charge element quantities', () => {
        beforeEach(() => {
          licence[0].reviewChargeVersions[0].reviewChargeReferences[0].amendedAuthorisedVolume = 10
          licence[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].amendedAllocated = 50
        })

        it('sets the "billableReturnsWarning" to true', () => {
          const result = ReviewLicencePresenter.go(billRun, licence)

          expect(result.chargeData[0].chargeReferences[0].billableReturnsWarning).to.equal(true)
        })
      })
    })
  })
})

function _billRun () {
  return {
    id: '6620135b-0ecf-4fd4-924e-371f950c0526',
    fromFinancialYearEnding: 2023,
    toFinancialYearEnding: 2023,
    region: {
      displayName: 'Anglian'
    }
  }
}

function _licenceData () {
  const billingAccountDetails = BillingAccountModel.fromJson({
    id: 'a17ae69b-8074-4d27-80bf-074f4c79a05a',
    accountNumber: 'E88896464A',
    company: {
      id: 'e44491db-2b33-4473-9c3a-b57aceabb6e8',
      name: 'Furland Farm',
      type: 'organisation'
    },
    billingAccountAddresses: [
      {
        id: 'eb5cb54a-0b51-4e4a-8472-dab993eb6157',
        billingAccountId: 'a17ae69b-8074-4d27-80bf-074f4c79a05a',
        addressId: 'cc32fefd-7f3e-4581-b437-78a3fae66d4b',
        startDate: new Date('2016-05-20'),
        endDate: null,
        companyId: null,
        contactId: null,
        company: null,
        contact: null,
        address: {
          id: 'cc32fefd-7f3e-4581-b437-78a3fae66d4b',
          address1: 'Furland Farm',
          address2: 'Furland',
          address3: null,
          address4: null,
          address5: 'Crewkerne',
          address6: 'Somerset',
          postcode: 'TA18 7TT',
          country: 'England'
        }
      }
    ]
  })

  return [{
    id: '5aa8e752-1a5c-4b01-9112-d92a543b70d1',
    billRunId: '82772a06-c8ce-45f7-8504-dd20ea8824e4',
    licenceId: '786f0d83-eaf7-43c3-9de5-ec59e3de05ee',
    licenceRef: '01/49/80/4608',
    licenceHolder: 'Licence Holder Ltd',
    issues: '',
    status: 'ready',
    progress: false,
    hasReviewStatus: false,
    reviewReturns: [{
      id: '2264f443-5c16-4ca9-8522-f63e2d4e38be',
      reviewLicenceId: '78a99c1c-26d3-4163-ab58-084cd78594ab',
      returnId: 'v1:1:01/60/28/3437:17061181:2022-04-01:2023-03-31',
      returnReference: '10031343',
      quantity: 0,
      allocated: 0,
      underQuery: false,
      returnStatus: 'completed',
      nilReturn: false,
      abstractionOutsidePeriod: false,
      receivedDate: new Date('2022-06-03'),
      dueDate: new Date('2022-06-03'),
      purposes: [{
        tertiary: {
          description: 'Site description'
        }
      }],
      description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
      startDate: new Date(' 2022-04-01'),
      endDate: new Date('2022-05-06'),
      issues: '',
      reviewChargeElements: [{
        id: 'e840f418-ca6b-4d96-9f36-bf684c78590f',
        reviewChargeReferenceId: '7759e0f9-5763-4b94-8d45-0621aea3edc1',
        chargeElementId: 'b1cd4f98-ad96-4901-9e21-4432f032492a',
        allocated: 0,
        chargeDatesOverlap: false,
        issues: '',
        status: 'ready'
      }],
      returnLog: {
        periodStartDay: 1,
        periodStartMonth: 4,
        periodEndDay: 31,
        periodEndMonth: 3
      }
    },
    {
      id: '4864f643-5c16-5ca9-8512-f63e1d4e58be',
      reviewLicenceId: '78a99c1c-26d3-4163-ab58-084cd78594ab',
      returnId: 'v2:1:01/60/28/3437:17061181:2022-04-01:2023-03-31',
      returnReference: '10031343',
      quantity: 0,
      allocated: 0,
      underQuery: false,
      returnStatus: 'completed',
      nilReturn: false,
      abstractionOutsidePeriod: false,
      receivedDate: new Date('2022-06-03'),
      dueDate: new Date('2022-06-03'),
      purposes: [{
        tertiary: {
          description: 'Site description'
        }
      }],
      description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
      startDate: new Date(' 2022-04-01'),
      endDate: new Date('2022-05-06'),
      issues: '',
      reviewChargeElements: [],
      returnLog: {
        periodStartDay: 1,
        periodStartMonth: 4,
        periodEndDay: 31,
        periodEndMonth: 3
      }
    }],
    reviewChargeVersions: [{
      id: '3de5634a-da26-4241-87e9-7248a4b83a69',
      reviewLicenceId: 'd9e78306-bf65-4020-b279-5ae471cea4e6',
      chargeVersionId: 'd103bb54-1819-4e77-b3d9-bc8913454e06',
      changeReason: 'Strategic review of charges (SRoC)',
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2022-06-05'),
      reviewChargeReferences: [{
        id: 'b2af5935-4b65-4dce-9f75-9073798f6375',
        reviewChargeVersionId: 'bd16e7b0-c2a3-4258-b873-b965fd74cdf5',
        chargeReferenceId: '82ce8695-5841-41b0-a1e7-d016407adad4',
        aggregate: 1,
        authorisedVolume: 200,
        amendedAuthorisedVolume: 200,
        chargeAdjustment: 1,
        createdAt: new Date('2024-03-18'),
        updatedAt: new Date('2024-03-18'),
        chargeReference: {
          chargeCategoryId: 'f100dc23-c6a7-4efa-af4f-80618260b32e',
          chargeCategory: {
            reference: '4.6.7',
            shortDescription: 'High loss, non-tidal, greater than 15 up to and including 50 ML/yr'
          }
        },
        reviewChargeElements: [{
          id: '8bc0cd32-400e-4a45-9dd7-fbce3d486031',
          reviewChargeReferenceId: '2210bb45-1efc-4e69-85cb-c8cc6e75c4fd',
          chargeElementId: 'b1001716-cfb4-43c6-91f0-1863f4529223',
          allocated: 10,
          amendedAllocated: 0,
          chargeDatesOverlap: false,
          issues: '',
          status: 'ready',
          chargeElement: {
            description: 'Trickle Irrigation - Direct',
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            authorisedAnnualQuantity: 200,
            purpose: {
              description: 'Make-up or top up water'
            }
          },
          reviewReturns: [{
            id: '2264f443-5c16-4ca9-8522-f63e2d4e38be',
            reviewLicenceId: '78a99c1c-26d3-4163-ab58-084cd78594ab',
            returnId: 'v1:1:01/60/28/3437:17061181:2022-04-01:2023-03-31',
            returnReference: '10031343',
            quantity: 0,
            allocated: 0,
            underQuery: false,
            returnStatus: 'completed',
            nilReturn: false,
            abstractionOutsidePeriod: false,
            receivedDate: new Date('2022-06-03'),
            dueDate: new Date('2022-06-03'),
            purposes: {},
            description: 'Lands at Mosshayne Farm, Exeter & Broadclyst',
            startDate: new Date(' 2022-04-01'),
            endDate: new Date('2022-05-06'),
            issues: ''
          }]
        }]
      }],
      chargeVersion: {
        billingAccountId: '67d7cacb-5d10-4a08-b7f8-e6ce98cbf4c8'
      },
      billingAccountDetails
    }]
  }]
}
