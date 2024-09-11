'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const AmendAdjustmentFactorService = require('../../app/services/bill-runs/two-part-tariff/amend-adjustment-factor.service.js')
const AmendAuthorisedVolumeService = require('../../app/services/bill-runs/two-part-tariff/amend-authorised-volume.service.js')
const AmendBillableReturnsService = require('../../app/services/bill-runs/two-part-tariff/amend-billable-returns.service.js')
const Boom = require('@hapi/boom')
const CalculateChargeService = require('../../app/services/bill-runs/two-part-tariff/calculate-charge.service.js')
const CancelBillRunService = require('../../app/services/bill-runs/cancel-bill-run.service.js')
const ChargeReferenceDetailsService = require('../../app/services/bill-runs/two-part-tariff/charge-reference-details.service.js')
const GenerateBillRunService = require('../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js')
const IndexBillRunsService = require('../../app/services/bill-runs/index-bill-runs.service.js')
const MatchDetailsService = require('../../app/services/bill-runs/two-part-tariff/match-details.service.js')
const RemoveBillRunLicenceService = require('../../app/services/bill-runs/two-part-tariff/remove-bill-run-licence.service.js')
const ReviewBillRunService = require('../../app/services/bill-runs/two-part-tariff/review-bill-run.service.js')
const ReviewLicenceService = require('../../app/services/bill-runs/two-part-tariff/review-licence.service.js')
const SendBillRunService = require('../../app/services/bill-runs/send-bill-run.service.js')
const StartBillRunProcessService = require('../../app/services/bill-runs/start-bill-run-process.service.js')
const SubmitAmendedAdjustmentFactorService = require('../../app/services/bill-runs/two-part-tariff/submit-amended-adjustment-factor.service.js')
const SubmitAmendedAuthorisedVolumeService = require('../../app/services/bill-runs/two-part-tariff/submit-amended-authorised-volume.service.js')
const SubmitAmendedBillableReturnsService = require('../../app/services/bill-runs/two-part-tariff/submit-amended-billable-returns.service.js')
const SubmitCancelBillRunService = require('../../app/services/bill-runs/submit-cancel-bill-run.service.js')
const SubmitRemoveBillRunLicenceService = require('../../app/services/bill-runs/two-part-tariff/submit-remove-bill-run-licence.service.js')
const SubmitReviewBillRunService = require('../../app/services/bill-runs/two-part-tariff/submit-review-bill-run.service.js')
const SubmitReviewLicenceService = require('../../app/services/bill-runs/two-part-tariff/submit-review-licence.service.js')
const SubmitSendBillRunService = require('../../app/services/bill-runs/submit-send-bill-run.service.js')
const ViewBillRunService = require('../../app/services/bill-runs/view-bill-run.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs controller', () => {
  let options
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/bill-runs', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/bill-runs?page=2',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when the request succeeds', () => {
        beforeEach(async () => {
          Sinon.stub(IndexBillRunsService, 'go').resolves({
            billRuns: [{
              id: '31fec553-f2de-40cf-a8d7-a5fb65f5761b',
              createdAt: '1 January 2024',
              link: '/system/bill-runs/31fec553-f2de-40cf-a8d7-a5fb65f5761b',
              number: 1002,
              numberOfBills: 7,
              region: 'Avalon',
              scheme: 'sroc',
              status: 'ready',
              total: '£200.00',
              type: 'Supplementary'
            }],
            busy: 'none',
            pageTitle: 'Bill runs (page 2 of 30)',
            pagination: {
              numberOfPages: 30,
              component: {
                previous: { href: '/system/bill-runs?page=1' },
                next: { href: '/system/bill-runs?page=3' },
                items: [
                  { number: 1, visuallyHiddenText: 'Page 1', href: '/system/bill-runs?page=1', current: false },
                  { number: 2, visuallyHiddenText: 'Page 2', href: '/system/bill-runs?page=2', current: true },
                  { number: 3, visuallyHiddenText: 'Page 3', href: '/system/bill-runs?page=3', current: false }
                ]
              }
            }
          })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Bill runs (page 2 of 30)')
          expect(response.payload).to.contain('Previous')
          expect(response.payload).to.contain('Next')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        options = postRequestOptions(
          '/bill-runs',
          {
            type: 'supplementary',
            scheme: 'sroc',
            region: '07ae7f3a-2677-4102-b352-cc006828948c',
            user: 'test.user@defra.gov.uk'
          }
        )
      })

      describe('when a request is valid', () => {
        const validResponse = {
          id: 'f561990b-b29a-42f4-b71a-398c52339f78',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          scheme: 'sroc',
          batchType: 'supplementary',
          status: 'processing'
        }

        beforeEach(async () => {
          Sinon.stub(StartBillRunProcessService, 'go').resolves(validResponse)
        })

        it('returns a 200 response including details of the new bill run', async () => {
          const response = await server.inject(options)
          const payload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(200)
          expect(payload).to.equal(validResponse)
        })
      })

      describe('when the request fails', () => {
        describe('because the request is invalid', () => {
          beforeEach(() => {
            options.payload.scheme = 'INVALID'
          })

          it('returns an error response', async () => {
            const response = await server.inject(options)
            const payload = JSON.parse(response.payload)

            expect(response.statusCode).to.equal(400)
            expect(payload.message).to.startWith('"scheme" must be')
          })
        })

        describe('because the bill run could not be initiated', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(StartBillRunProcessService, 'go').rejects()
          })

          it('returns an error response', async () => {
            const response = await server.inject(options)
            const payload = JSON.parse(response.payload)

            expect(response.statusCode).to.equal(500)
            expect(payload.message).to.equal('An internal server error occurred')
          })
        })
      })
    })
  })

  describe('/bill-runs/{id}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions()
      })

      describe('when the request succeeds', () => {
        describe('and it is for a bill run with multiple bill groups', () => {
          beforeEach(async () => {
            Sinon.stub(ViewBillRunService, 'go').resolves(_multiGroupBillRun())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('2 Annual bills')
            expect(response.payload).to.contain('1 water company')
            expect(response.payload).to.contain('1 other abstractor')
          })
        })

        describe('and it is for a bill run with a single bill group', () => {
          beforeEach(async () => {
            Sinon.stub(ViewBillRunService, 'go').resolves(_singleGroupBillRun())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('1 Annual bill')
            // NOTE: If we only have 1 bill group we show a single table with no caption
            expect(response.payload).not.to.contain('1 water company')
            expect(response.payload).not.to.contain('1 other abstractor')
          })
        })
      })
    })
  })

  describe('/bill-runs/{id}/cancel', () => {
    describe('GET /bill-runs/{id}/cancel', () => {
      beforeEach(async () => {
        options = _getRequestOptions('cancel')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(CancelBillRunService, 'go').resolves({
            id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
            billRunType: 'Two-part tariff',
            pageTitle: "You're about to cancel this bill run"
          })
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You&#39;re about to cancel this bill run')
          expect(response.payload).to.contain('Two-part tariff')
        })
      })
    })

    describe('POST /bill-runs/{id}/cancel', () => {
      beforeEach(() => {
        options = _postRequestOptions('cancel')
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitCancelBillRunService, 'go').resolves()
        })

        it('redirects to the bill runs page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/bill-runs')
        })
      })

      describe('when the request fails', () => {
        describe('because the cancelling service threw an error', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(SubmitCancelBillRunService, 'go').rejects()
          })

          it('returns the error page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })

  describe('/bill-runs/{id}/remove/{licenceId}', () => {
    const licenceId = '949aab20-d3fc-4726-aace-6bd2def6a146'

    describe('GET /bill-runs/{id}/remove/{licenceId}', () => {
      beforeEach(async () => {
        options = _getRequestOptions(`remove/${licenceId}`)
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(RemoveBillRunLicenceService, 'go').resolves({
            pageTitle: "You're about to remove 01/123/ABC from the bill run",
            backLink: `../review/${licenceId}`,
            billRunNumber: 12345,
            billRunStatus: 'review',
            dateCreated: '3 May 2024',
            financialYear: '2022 to 2023',
            licenceRef: '01/123/ABC',
            region: 'Test region'
          })
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You&#39;re about to remove 01/123/ABC from the bill run')
          expect(response.payload).to.contain(`../review/${licenceId}`)
          expect(response.payload).to.contain('12345')
          expect(response.payload).to.contain('review')
          expect(response.payload).to.contain('3 May 2024')
          expect(response.payload).to.contain('2022 to 2023')
          expect(response.payload).to.contain('01/123/ABC')
          expect(response.payload).to.contain('Test region')
        })
      })
    })

    describe('POST /bill-runs/{id}/remove/{licenceId}', () => {
      beforeEach(() => {
        options = _postRequestOptions(`remove/${licenceId}`)
      })

      describe('when a request is valid and licences still remain in the bill run', () => {
        beforeEach(() => {
          Sinon.stub(SubmitRemoveBillRunLicenceService, 'go').resolves(false)
        })

        it('redirects to the Review licences page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review')
        })
      })

      describe('when a request is valid and NO licences remain in the bill run', () => {
        beforeEach(() => {
          Sinon.stub(SubmitRemoveBillRunLicenceService, 'go').resolves(true)
        })

        it('redirects to the Bill runs page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/bill-runs')
        })
      })
    })
  })

  describe('/bill-runs/{id}/review', () => {
    describe('GET', () => {
      let ReviewBillRunServiceStub

      describe('when a request is valid with no pagination', () => {
        beforeEach(() => {
          options = _getRequestOptions('review')
          ReviewBillRunServiceStub = Sinon.stub(ReviewBillRunService, 'go').resolves(_reviewBillRunData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)
          const ReviewBillRunServiceArgs = ReviewBillRunServiceStub.args[0]

          expect(response.statusCode).to.equal(200)
          expect(ReviewBillRunServiceArgs[0]).to.equal('97db1a27-8308-4aba-b463-8a6af2558b28')
          expect(ReviewBillRunServiceArgs[1]).to.equal(undefined)
          expect(response.payload).to.contain('two-part tariff')
          expect(response.payload).to.contain('Southern (Test replica)')
          expect(response.payload).to.contain('Showing all 2 licences')
        })
      })

      describe('when a request is valid with pagination', () => {
        beforeEach(() => {
          options = _getRequestOptions('review?page=2')
          ReviewBillRunServiceStub = Sinon.stub(ReviewBillRunService, 'go').resolves(_reviewBillRunData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)
          const ReviewBillRunServiceArgs = ReviewBillRunServiceStub.args[0]

          expect(response.statusCode).to.equal(200)
          expect(ReviewBillRunServiceArgs[0]).to.equal('97db1a27-8308-4aba-b463-8a6af2558b28')
          expect(ReviewBillRunServiceArgs[1]).to.equal('2')
          expect(response.payload).to.contain('two-part tariff')
          expect(response.payload).to.contain('Southern (Test replica)')
          expect(response.payload).to.contain('Showing all 2 licences')
        })
      })
    })

    describe('POST', () => {
      beforeEach(async () => {
        options = _postRequestOptions('review')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitReviewBillRunService, 'go').resolves()
        })

        it('redirects to the review licences page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review'
          )
        })
      })
    })
  })

  describe('/bill-runs/{id}/review/{licenceId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions('review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(ReviewLicenceService, 'go').resolves(_licenceReviewData())
        })

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
        options = _postRequestOptions('review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitReviewLicenceService, 'go').resolves()
        })

        it('redirects to the review licence page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e')
        })
      })
    })
  })

  describe('/bill-runs/{id}/review/{licenceId}/charge-reference-details/{reviewChargeReferenceId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(
          'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/charge-reference-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(ChargeReferenceDetailsService, 'go').resolves(_chargeReferenceData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('4.6.24')
          expect(response.payload).to.contain('Total billable returns')
          expect(response.payload).to.contain('Aggregate factor (0.5)')
        })
      })
    })
  })

  describe('/bill-runs/{id}/review/{licenceId}/charge-reference-details/{reviewChargeReferenceId}/amend-adjustment-factor', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(
          'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/charge-reference-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2/amend-adjustment-factor')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(AmendAdjustmentFactorService, 'go').resolves(_chargeReferenceData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('High loss, non-tidal, restricted water, greater than 85 up to and including 120 ML/yr')
          expect(response.payload).to.contain('Set the adjustment factors')
          expect(response.payload).to.contain('Aggregate factor')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        options = _postRequestOptions(
          'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/charge-reference-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2/amend-adjustment-factor'
        )
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitAmendedAdjustmentFactorService, 'go').resolves(_chargeReferenceData())
        })

        it('redirects to the charge reference details page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/charge-reference-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitAmendedAdjustmentFactorService, 'go').resolves(_chargeReferenceData(true))
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('The aggregate factor must be a number')
          expect(response.payload).to.contain('There is a problem')
        })
      })

      describe('when the request fails', () => {
        describe('because the sending service threw an error', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(SubmitAmendedAdjustmentFactorService, 'go').rejects()
          })

          it('returns the error page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })

  describe('/bill-runs/{id}/review/{licenceId}/charge-reference-details/{reviewChargeReferenceId}/amend-authorised-volume', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(
          'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/charge-reference-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2/amend-authorised-volume')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(AmendAuthorisedVolumeService, 'go').resolves(_authorisedVolumeData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('High loss, non-tidal, restricted water, greater than 85 up to and including 120 ML/yr')
          expect(response.payload).to.contain('Set the authorised volume')
          expect(response.payload).to.contain('Total billable returns')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        options = _postRequestOptions(
          'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/charge-reference-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2/amend-authorised-volume'
        )
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitAmendedAuthorisedVolumeService, 'go').resolves(_chargeReferenceData())
        })

        it('redirects to the charge reference details page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/charge-reference-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitAmendedAuthorisedVolumeService, 'go').resolves(_authorisedVolumeData(true))
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('The authorised volume must be a number')
          expect(response.payload).to.contain('There is a problem')
        })
      })

      describe('when the request fails', () => {
        describe('because the sending service threw an error', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(SubmitAmendedAuthorisedVolumeService, 'go').rejects()
          })

          it('returns the error page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })

  describe('/bill-runs/{id}/review/{licenceId}/match-details/{reviewChargeElementId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(
          'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/match-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'
        )
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(MatchDetailsService, 'go').resolves(_chargeElementDetails())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Charge period 1 April 2022 to 31 March 2023')
          expect(response.payload).to.contain('Financial year 2022 to 2023')
          expect(response.payload).to.contain('River Test and tributaries near Fullerton Grange, Andover')
        })
      })
    })
  })

  describe('/bill-runs/{id}/review/{licenceId}/match-details/{reviewChargeElementId}/amend-billable-returns', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions(
          'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/match-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2/amend-billable-returns'
        )
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(AmendBillableReturnsService, 'go').resolves(_billableReturnData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Spray irrigation - storage, Abstraction from borehole at Chipping Norton')
          expect(response.payload).to.contain('Financial year 2022 to 2023')
          expect(response.payload).to.contain('Authorised 40ML')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        options = _postRequestOptions(
          'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/match-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2/amend-billable-returns'
        )
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitAmendedBillableReturnsService, 'go').resolves(_matchDetailsData())
        })

        it('redirects to the match details page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            '/system/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e/match-details/9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'
          )
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitAmendedBillableReturnsService, 'go').resolves(_billableReturnData(true))
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the billable quantity')
          expect(response.payload).to.contain('There is a problem')
        })
      })

      describe('when the request fails', () => {
        describe('because the sending service threw an error', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(SubmitAmendedBillableReturnsService, 'go').rejects()
          })

          it('returns the error page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })

  describe('/bill-runs/{id}/review/{licenceId}/preview-charge/{reviewChargeReferenceId}', () => {
    describe('GET', () => {
      const licenceId = '87cb11cf-1e5e-448d-8050-29f4e681b416'
      const reviewChargeReferenceId = '7c09753d-f606-4deb-a929-4bc8aa7acb8d'

      beforeEach(async () => {
        options = _getRequestOptions(`review/${licenceId}/preview-charge/${reviewChargeReferenceId}`)
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(CalculateChargeService, 'go').resolves()
        })

        it('redirects to the review charge reference details page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(
            `/system/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review/${licenceId}/charge-reference-details/${reviewChargeReferenceId}`
          )
        })
      })
    })
  })

  describe('/bill-runs/{id}/send', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions('send')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SendBillRunService, 'go').resolves({
            id: '8702b98f-ae51-475d-8fcc-e049af8b8d38',
            billRunType: 'Two-part tariff',
            pageTitle: "You're about to send this bill run"
          })
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You&#39;re about to send this bill run')
          expect(response.payload).to.contain('Two-part tariff')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        options = _postRequestOptions('send')
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitSendBillRunService, 'go').resolves()
        })

        it('redirects to the legacy processing bill run page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/billing/batch/97db1a27-8308-4aba-b463-8a6af2558b28/processing')
        })
      })

      describe('when the request fails', () => {
        describe('because the sending service threw an error', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(SubmitSendBillRunService, 'go').rejects()
          })

          it('returns the error page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })

  describe('/bill-runs/{id}/two-part-tariff', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions('two-part-tariff')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(GenerateBillRunService, 'go').resolves('97db1a27-8308-4aba-b463-8a6af2558b28')
        })

        it('redirects to the bill runs page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/bill-runs')
        })
      })

      describe('when the request fails', () => {
        describe('because the generate service threw an error', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(GenerateBillRunService, 'go').rejects()
          })

          it('returns the error page', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Sorry, there is a problem with the service')
          })
        })
      })
    })
  })
})

function _authorisedVolumeData (error = false) {
  const pageData = {
    billRunId: '97db1a27-8308-4aba-b463-8a6af2558b28',
    financialYear: '2022 to 2023',
    chargePeriod: '1 April 2022 to 31 March 2023',
    chargeReference: {
      id: '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2',
      description: 'High loss, non-tidal, restricted water, greater than 85 up to and including 120 ML/yr',
      authorisedVolume: 150,
      totalBillableReturns: 140
    },
    chargeCategory: {
      minVolume: 10,
      maxVolume: 170
    }
  }

  if (error) {
    pageData.error = { authorisedVolume: 'The authorised volume must be a number' }
  }

  return pageData
}

function _billableReturnData (error = false) {
  const pageDate = {
    chargeElement: {
      description: 'Spray irrigation - storage, Abstraction from borehole at Chipping Norton',
      dates: '25 July 2022 to 29 December 2022'
    },
    billRun: {
      financialYear: '2022 to 2023'
    },
    chargeVersion: {
      chargePeriod: '1 April 2022 to 31 March 2023'
    },
    authorisedQuantity: 40
  }
  if (error) {
    pageDate.error = { message: 'Select the billable quantity' }
  }

  return pageDate
}

function _chargeElementDetails () {
  return {
    billRunId: '97db1a27-8308-4aba-b463-8a6af2558b28',
    financialYear: '2022 to 2023',
    chargePeriod: '1 April 2022 to 31 March 2023',
    chargeElement: {
      chargeElementId: '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2',
      description: 'River Test and tributaries near Fullerton Grange, Andover',
      dates: '1 April 2022 to 31 October 2022',
      status: 'Ready',
      billableVolume: 10,
      authorisedVolume: 10,
      issues: []
    },
    matchedReturns: {}
  }
}

function _chargeReferenceData (error = false) {
  const pageData = {
    billRunId: '97db1a27-8308-4aba-b463-8a6af2558b28',
    financialYear: '2022 to 2023',
    chargePeriod: '1 April 2022 to 31 March 2023',
    chargeReference: {
      reference: '4.6.24',
      description: 'High loss, non-tidal, restricted water, greater than 85 up to and including 120 ML/yr',
      totalBillableReturns: 5,
      authorisedVolume: 10,
      adjustments: ['Aggregate factor (0.5)']
    }
  }

  if (error) {
    pageData.error = {
      aggregateFactorElement: {
        text: 'The aggregate factor must be a number'
      },
      chargeAdjustmentElement: null
    }
    pageData.inputtedAggregateValue = '10'
  }

  return pageData
}

function _getRequestOptions (path) {
  const root = '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28'
  const url = path ? `${root}/${path}` : root

  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}

function _postRequestOptions (path) {
  const root = '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28'
  const url = path ? `${root}/${path}` : root

  return postRequestOptions(url)
}

function _licenceReviewData () {
  return {
    billRunId: '97db1a27-8308-4aba-b463-8a6af2558b28',
    region: 'Southern (Test replica)',
    licence: {
      licenceId: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
      licenceRef: '1/11/10/*S/0084',
      status: 'review',
      licenceHolder: 'Licence Holder Ltd'
    },
    chargePeriodDates: ['1 April 2022 to 31 March 2023'],
    matchedReturns: [
      {
        returnId: '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2',
        reference: '11142960',
        dates: '1 November 2021 to 31 October 2022',
        status: 'completed',
        description: 'Test Road. Points 1 and 2.',
        purpose: 'Spray Irrigation - Anti Frost',
        total: '0 ML / 0 ML',
        issues: ['Returns received late']
      }
    ],
    unmatchedReturns: [],
    chargeData: []
  }
}

function _matchDetailsData () {
  return {
    billRunId: '6620135b-0ecf-4fd4-924e-371f950c0526',
    financialYear: '2022 to 2023',
    chargePeriod: '1 April 2022 to 5 June 2022',
    licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1',
    showBanner: true,
    chargeElement: {
      chargeElementId: 'b4d70c89-de1b-4f68-a47f-832b338ac044',
      description: 'Trickle Irrigation - Direct',
      dates: ['1 April 2022 to 5 June 2022'],
      status: 'ready',
      billableVolume: 0,
      authorisedVolume: 200,
      issues: []
    },
    matchedReturns: []
  }
}

function _multiGroupBillRun () {
  return {
    billsCount: '2 Annual bills',
    billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
    billRunNumber: 10003,
    billRunStatus: 'sent',
    billRunTotal: '£213,275.00',
    billRunType: 'Annual',
    chargeScheme: 'Current',
    creditsCount: '0 credit notes',
    creditsTotal: '£0.00',
    dateCreated: '7 March 2023',
    debitsCount: '2 invoices',
    debitsTotal: '£213,275.00',
    displayCreditDebitTotals: false,
    financialYear: '2022 to 2023',
    pageTitle: 'South West annual',
    region: 'South West',
    transactionFile: 'nalei90002t',
    billGroupsCount: 2,
    billGroups: [
      {
        type: 'water-companies',
        caption: '1 water company',
        bills: [{
          id: '64924759-8142-4a08-9d1e-1e902cd9d316',
          accountNumber: 'E22288888A',
          billingContact: 'Acme Water Services Ltd',
          licences: ['17/53/001/A/101', '17/53/002/B/205', '17/53/002/C/308'],
          licencesCount: 3,
          financialYear: 2023,
          total: '£213,178.00'
        }]
      },
      {
        type: 'other-abstractors',
        caption: '1 other abstractor',
        bills: [{
          id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
          accountNumber: 'E11101999A',
          billingContact: 'Geordie Leforge',
          licences: ['17/53/001/G/782'],
          licencesCount: 1,
          financialYear: 2023,
          total: '£97.00'
        }]
      }
    ],
    view: 'bill-runs/view.njk'
  }
}

function _reviewBillRunData () {
  return {
    region: 'Southern (Test replica)',
    status: 'review',
    dateCreated: '6 November 2023',
    financialYear: '2021 to 2022',
    billRunType: 'two-part tariff',
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
  }
}

function _singleGroupBillRun () {
  return {
    billsCount: '1 Annual bill',
    billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
    billRunNumber: 10003,
    billRunStatus: 'sent',
    billRunTotal: '£97.00',
    billRunType: 'Annual',
    chargeScheme: 'Current',
    creditsCount: '0 credit notes',
    creditsTotal: '£0.00',
    dateCreated: '7 March 2023',
    debitsCount: '1 invoice',
    debitsTotal: '£97.00',
    displayCreditDebitTotals: false,
    financialYear: '2022 to 2023',
    pageTitle: 'South West annual',
    region: 'South West',
    transactionFile: 'nalei90002t',
    billGroupsCount: 1,
    billGroups: [
      {
        type: 'other-abstractors',
        caption: '1 other abstractor',
        bills: [{
          id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
          accountNumber: 'E11101999A',
          billingContact: 'Geordie Leforge',
          licences: ['17/53/001/G/782'],
          licencesCount: 1,
          financialYear: 2023,
          total: '£97.00'
        }]
      }
    ],
    view: 'bill-runs/view.njk'
  }
}
