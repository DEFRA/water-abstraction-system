'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { closeConnection } = require('../support/database.js')
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const AuthorisedService = require('../../app/services/bill-runs/review/authorised.service.js')
const EditService = require('../../app/services/bill-runs/review/edit.service.js')
const FactorsService = require('../../app/services/bill-runs/review/factors.service.js')
const PreviewService = require('../../app/services/bill-runs/review/preview.service.js')
const ReviewBillRunService = require('../../app/services/bill-runs/review/review-bill-run.service.js')
const ReviewChargeElementService = require('../../app/services/bill-runs/review/review-charge-element.service.js')
const ReviewChargeReferenceService = require('../../app/services/bill-runs/review/review-charge-reference.service.js')
const ReviewLicenceService = require('../../app/services/bill-runs/review/review-licence.service.js')
const SubmitAuthorisedService = require('../../app/services/bill-runs/review/submit-authorised.service.js')
const SubmitEditService = require('../../app/services/bill-runs/review/submit-edit.service.js')
const SubmitFactorsService = require('../../app/services/bill-runs/review/submit-factors.service.js')
const SubmitRemoveService = require('../../app/services/bill-runs/review/submit-remove.service.js')
const SubmitReviewBillRunService = require('../../app/services/bill-runs/review/submit-review-bill-run.service.js')
const RemoveService = require('../../app/services/bill-runs/review/remove.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs Review controller', () => {
  let options
  let path
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
  })

  describe('/bill-runs/review/{billRunId}', () => {
    beforeEach(() => {
      path = '97db1a27-8308-4aba-b463-8a6af2558b28'
    })

    describe('GET', () => {
      beforeEach(() => {
        Sinon.stub(ReviewBillRunService, 'go').resolves({
          region: 'Southern (Test replica)',
          status: 'review',
          dateCreated: '6 November 2023',
          financialYear: '2021 to 2022',
          billRunType: 'two-part tariff',
          billRunTitle: 'Southern (Test Replica) two-part tariff',
          numberOfLicencesDisplayed: 2,
          numberOfLicencesToReview: 1,
          totalNumberOfLicences: 2,
          preparedLicences: [
            {
              licenceId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
              licenceRef: '1/11/11/*1/1111',
              licenceHolder: 'Big Farm Ltd',
              status: 'review',
              issue: 'Multiple Issues'
            },
            {
              licenceId: '9442527a-64f3-471a-a3e4-fa0683a3d505',
              licenceRef: '2/22/22/*2/2222',
              licenceHolder: 'Small Farm Ltd',
              status: 'ready',
              issue: 'Multiple Issues'
            }
          ],
          filter: {
            issues: undefined,
            licenceHolder: undefined,
            licenceStatus: undefined,
            openFilter: false
          }
        })
      })

      describe('when a request is valid', () => {
        describe('with no pagination', () => {
          beforeEach(() => {
            options = _getRequestOptions(path)
          })

          it('returns a 200 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Southern (Test Replica) two-part tariff')
            expect(response.payload).to.contain('Showing all 2 licences')
          })
        })

        describe('with pagination', () => {
          beforeEach(() => {
            options = _getRequestOptions(path, 'page=2')
          })

          it('returns a 200 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Southern (Test Replica) two-part tariff')
            expect(response.payload).to.contain('Showing all 2 licences')
          })
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = _postRequestOptions(path)

        Sinon.stub(SubmitReviewBillRunService, 'go').resolves()
      })

      describe('when a request is valid', () => {
        it('redirects to the review licences page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/bill-runs/review/97db1a27-8308-4aba-b463-8a6af2558b28')
        })
      })
    })
  })

  describe('/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}', () => {
    beforeEach(() => {
      path = 'charge-element/a1840523-a04c-4c64-bff7-4a515e8ba1c1/1'
    })

    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(path)

        Sinon.stub(ReviewChargeElementService, 'go').resolves({
          authorisedVolume: 9.092,
          billableReturns: 0,
          chargeDescription: 'Spray Irrigation - Direct',
          chargePeriod: '1 April 2023 to 31 March 2024',
          chargePeriods: ['1 April 2023 to 30 September 2023'],
          elementCount: 1,
          elementIndex: '1',
          financialPeriod: '2023 to 2024',
          issues: ['Aggregate'],
          licenceId: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
          matchedReturns: [
            {
              abstractionPeriod: '1 April to 30 September',
              description: 'Borehole in top field',
              issues: [Array],
              purpose: 'Spray Irrigation - Direct',
              reference: '11142960',
              returnId: 'v1:5:1/11/10/*S/0084:11142960:2022-11-01:2023-10-31',
              returnLink: '/returns/return?id=v1:5:1/11/10/*S/0084:11142960:2022-11-01:2023-10-31',
              returnPeriod: '1 November 2022 to 31 October 2023',
              returnStatus: 'completed',
              returnTotal: '0 ML / 0 ML'
            }
          ],
          reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1',
          reviewLicenceId: 'deaffa60-6488-4e54-a402-485d43aca1af',
          status: 'review'
        })
      })

      describe('when a request is valid', () => {
        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Spray Irrigation - Direct')
          expect(response.payload).to.contain('Element 1 of 1')
          expect(response.payload).to.contain('Matched returns')
        })
      })
    })
  })

  describe('/bill-runs/review/charge-element/{reviewChargeElementId}/{elementIndex}/edit', () => {
    beforeEach(() => {
      path = 'charge-element/a1840523-a04c-4c64-bff7-4a515e8ba1c1/1/edit'
    })

    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(path)
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(EditService, 'go').resolves({
            pageTitle: 'Set the billable returns quantity for this bill run',
            authorisedQuantity: 9.092,
            billableReturns: 0,
            chargeDescription: 'Spray Irrigation - Direct',
            chargePeriod: '1 April 2023 to 31 March 2024',
            chargePeriods: ['1 April 2023 to 30 September 2023'],
            elementIndex: '1',
            financialPeriod: '2023 to 2024',
            reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
          })
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Set the billable returns quantity for this bill run')
          expect(response.payload).to.contain('Spray Irrigation - Direct')
          expect(response.payload).to.contain('Billable returns')
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = _postRequestOptions(path)
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitEditService, 'go').resolves({})
        })

        it('redirects to the Review charge element page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/review/charge-element/a1840523-a04c-4c64-bff7-4a515e8ba1c1/1'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitEditService, 'go').resolves({
            customQuantitySelected: false,
            customQuantityValue: undefined,
            error: {
              errorList: [{ href: '#quantityOptions-error', text: 'Select the billable quantity' }],
              quantityOptionsErrorMessage: { text: 'Select the billable quantity' }
            },
            pageTitle: 'Set the billable returns quantity for this bill run',
            authorisedQuantity: 9.092,
            billableReturns: 0,
            chargeDescription: 'Spray Irrigation - Direct',
            chargePeriod: '1 April 2023 to 31 March 2024',
            chargePeriods: ['1 April 2023 to 30 September 2023'],
            elementIndex: '1',
            financialPeriod: '2023 to 2024',
            reviewChargeElementId: 'a1840523-a04c-4c64-bff7-4a515e8ba1c1'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Set the billable returns quantity for this bill ru')
          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('Select the billable quantity')
        })
      })
    })
  })

  describe('/bill-runs/review/charge-reference/{reviewChargeReferenceId}', () => {
    beforeEach(() => {
      path = 'charge-reference/7c09753d-f606-4deb-a929-4bc8aa7acb8d'
    })

    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(path)

        Sinon.stub(ReviewChargeReferenceService, 'go').resolves({
          additionalCharges: '',
          adjustments: ['Aggregate factor (0.333333333)', 'Two part tariff agreement'],
          amendedAuthorisedVolume: 9.092,
          canAmend: true,
          chargeCategory: '4.6.5',
          chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
          chargePeriod: '1 April 2023 to 31 March 2024',
          financialPeriod: '2023 to 2024',
          reviewChargeReferenceId: '7c09753d-f606-4deb-a929-4bc8aa7acb8d',
          reviewLicenceId: 'deaffa60-6488-4e54-a402-485d43aca1af',
          totalBillableReturns: 0
        })
      })

      describe('when a request is valid', () => {
        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Charge reference 4.6.5')
          expect(response.payload).to.contain(
            'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model'
          )
          expect(response.payload).to.contain('Reference details')
        })
      })
    })
  })

  describe('/bill-runs/review/charge-reference/{reviewChargeReferenceId}/authorised', () => {
    beforeEach(() => {
      path = 'charge-reference/7c09753d-f606-4deb-a929-4bc8aa7acb8d/authorised'
    })

    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(path)
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(AuthorisedService, 'go').resolves({
            amendedAuthorisedVolume: 9.092,
            chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
            chargePeriod: '1 April 2023 to 31 March 2024',
            financialPeriod: '2023 to 2024',
            reviewChargeReferenceId: '7c09753d-f606-4deb-a929-4bc8aa7acb8d',
            totalBillableReturns: 0,
            pageTitle: 'Set the authorised volume'
          })
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Set the authorised volume')
          expect(response.payload).to.contain(
            'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model'
          )
          expect(response.payload).to.contain('Total billable returns')
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = _postRequestOptions(path)
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitAuthorisedService, 'go').resolves({})
        })

        it('redirects to the Review charge reference page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/review/charge-reference/7c09753d-f606-4deb-a929-4bc8aa7acb8d'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitAuthorisedService, 'go').resolves({
            amendedAuthorisedVolume: 'foo',
            error: { text: 'The authorised volume must be a number' },
            pageTitle: 'Set the authorised volume',
            chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
            chargePeriod: '1 April 2023 to 31 March 2024',
            financialPeriod: '2023 to 2024',
            reviewChargeReferenceId: '7c09753d-f606-4deb-a929-4bc8aa7acb8d',
            totalBillableReturns: 0
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Set the authorised volume')
          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('The authorised volume must be a number')
        })
      })
    })
  })

  describe('/bill-runs/review/charge-reference/{reviewChargeReferenceId}/factors', () => {
    beforeEach(() => {
      path = 'charge-reference/7c09753d-f606-4deb-a929-4bc8aa7acb8d/factors'
    })

    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(path)
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(FactorsService, 'go').resolves({
            amendedAggregate: 0.333333333,
            amendedChargeAdjustment: 1,
            chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
            chargePeriod: '1 April 2023 to 31 March 2024',
            financialPeriod: '2023 to 2024',
            otherAdjustments: ['Two part tariff agreement'],
            reviewChargeReferenceId: '7c09753d-f606-4deb-a929-4bc8aa7acb8d',
            pageTitle: 'Set the adjustment factors'
          })
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Set the adjustment factors')
          expect(response.payload).to.contain(
            'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model'
          )
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = _postRequestOptions(path)
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitFactorsService, 'go').resolves({})
        })

        it('redirects to the Review charge reference page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/review/charge-reference/7c09753d-f606-4deb-a929-4bc8aa7acb8d'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitFactorsService, 'go').resolves({
            amendedAggregate: 'foo',
            amendedChargeAdjustment: '1',
            error: {
              errorList: [{ href: '#amended-aggregate', text: 'The aggregate factor must be a number' }],
              amendedAggregate: { message: 'The aggregate factor must be a number' }
            },
            pageTitle: 'Set the adjustment factors',
            chargeDescription: 'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
            chargePeriod: '1 April 2023 to 31 March 2024',
            financialPeriod: '2023 to 2024',
            otherAdjustments: ['Two part tariff agreement'],
            reviewChargeReferenceId: '7c09753d-f606-4deb-a929-4bc8aa7acb8d'
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Set the adjustment factors')
          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('The aggregate factor must be a number')
        })
      })
    })
  })

  describe('/bill-runs/review/charge-reference/{reviewChargeReferenceId}/preview', () => {
    beforeEach(() => {
      path = 'charge-reference/7c09753d-f606-4deb-a929-4bc8aa7acb8d/preview'
    })

    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(path)

        Sinon.stub(PreviewService, 'go').resolves()
      })

      describe('when a request is valid', () => {
        it('redirects to the Review charge reference page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/review/charge-reference/7c09753d-f606-4deb-a929-4bc8aa7acb8d'
          )
        })
      })
    })
  })

  describe('/bill-runs/review/licence/{reviewLicenceId}', () => {
    beforeEach(() => {
      path = 'licence/deaffa60-6488-4e54-a402-485d43aca1af'
    })

    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(path)

        Sinon.stub(ReviewLicenceService, 'go').resolves({
          billRunId: '97db1a27-8308-4aba-b463-8a6af2558b28',
          chargeVersions: [
            {
              billingAccountDetails: [
                {
                  billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
                  accountNumber: 'E99999999A',
                  accountName: 'Mr B Blobby',
                  contactName: null,
                  addressLines: ['C/O Noel Edmonds', 'Crinkley Bottom', 'Cricket St Thomas', 'Somerset', 'TA20 1KL']
                }
              ],
              chargePeriod: '1 April 2023 to 31 March 2024',
              chargeReferences: [
                {
                  billableReturnsWarning: false,
                  chargeCategory: 'Charge reference 4.6.5',
                  chargeDescription:
                    'High loss, non-tidal, restricted water, up to and including 15 ML/yr, Tier 1 model',
                  id: '7c09753d-f606-4deb-a929-4bc8aa7acb8d',
                  chargeElements: [
                    {
                      billableReturns: '0 ML / 9.092 ML',
                      chargePeriods: ['1 April 2023 to 30 September 2023'],
                      returnVolumes: ['0 ML (11142960)'],
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
          licenceId: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
          licenceRef: '1/11/10/*S/0084',
          matchedReturns: [
            {
              abstractionPeriod: '1 April to 30 September',
              description: 'Test Road. Points 1 and 2.',
              issues: ['Returns received late'],
              purpose: 'Spray Irrigation - Direct',
              reference: '11142960',
              returnId: 'v1:5:1/11/10/*S/0084:11142960:2022-11-01:2023-10-31',
              returnLink: '/returns/return?id=v1:5:1/11/10/*S/0084:11142960:2022-11-01:2023-10-31',
              returnPeriod: '1 November 2022 to 31 October 2023',
              returnStatus: 'completed',
              returnTotal: '0 ML / 0 ML'
            }
          ],
          pageTitle: 'Licence 13/43/028/S/045',
          progress: false,
          region: 'Southern (Test replica)',
          reviewLicenceId: 'deaffa60-6488-4e54-a402-485d43aca1af',
          status: 'review',
          unmatchedReturns: []
        })
      })

      describe('when a request is valid', () => {
        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('1/11/10/*S/0084')
          expect(response.payload).to.contain('two-part tariff')
          expect(response.payload).to.contain('Test Road. Points 1 and 2.')
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = _postRequestOptions(path)
      })

      describe('when a request is valid', () => {
        it('redirects to the Review licence page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/review/licence/deaffa60-6488-4e54-a402-485d43aca1af'
          )
        })
      })
    })
  })

  describe('/bill-runs/review/licence/{reviewLicenceId}/remove', () => {
    beforeEach(() => {
      path = 'licence/deaffa60-6488-4e54-a402-485d43aca1af/remove'
    })

    describe('GET', () => {
      beforeEach(() => {
        options = _getRequestOptions(path)

        Sinon.stub(RemoveService, 'go').resolves({
          billRunNumber: 12345,
          billRunStatus: 'review',
          dateCreated: '3 May 2024',
          financialYearPeriod: '2022 to 2023',
          licenceRef: '01/123/ABC',
          pageTitle: "You're about to remove 01/123/ABC from the bill run",
          region: 'Test region',
          reviewLicenceId: '70703eac-cab6-4eff-906d-2832fe27b646'
        })
      })

      describe('when a request is valid', () => {
        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You&#39;re about to remove 01/123/ABC from the bill run')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        options = _postRequestOptions(path)
      })

      describe('when there are still licences to review in the bill run', () => {
        beforeEach(() => {
          options = _postRequestOptions(path)

          Sinon.stub(SubmitRemoveService, 'go').resolves({
            billRunId: '97db1a27-8308-4aba-b463-8a6af2558b28',
            empty: false
          })
        })

        describe('when a request is valid', () => {
          it('redirects to the Review bill run page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/bill-runs/review/97db1a27-8308-4aba-b463-8a6af2558b28')
          })
        })
      })

      describe('when there are no licences left to review in the bill run', () => {
        beforeEach(() => {
          options = _postRequestOptions(path)

          Sinon.stub(SubmitRemoveService, 'go').resolves({
            billRunId: '97db1a27-8308-4aba-b463-8a6af2558b28',
            empty: true
          })
        })

        describe('when a request is valid', () => {
          it('redirects to the Bill runs page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/bill-runs')
          })
        })
      })
    })
  })
})

function _getRequestOptions(path, query = null) {
  const root = '/bill-runs/review'
  const rootPath = path ? `${root}/${path}` : root
  const url = query ? `${rootPath}?${query}` : rootPath

  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}

function _postRequestOptions(path) {
  const root = '/bill-runs/review'
  const rootPath = path ? `${root}/${path}` : root

  return postRequestOptions(rootPath)
}
