'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const Boom = require('@hapi/boom')
const CancelBillRunService = require('../../app/services/bill-runs/cancel-bill-run.service.js')
const ReviewLicenceService = require('../../app/services/bill-runs/two-part-tariff/review-licence.service.js')
const ReviewBillRunService = require('../../app/services/bill-runs/two-part-tariff/review-bill-run.service.js')
const SendBillRunService = require('../../app/services/bill-runs/send-bill-run.service.js')
const StartBillRunProcessService = require('../../app/services/bill-runs/start-bill-run-process.service.js')
const SubmitCancelBillRunService = require('../../app/services/bill-runs/submit-cancel-bill-run.service.js')
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
    describe('POST', () => {
      beforeEach(() => {
        options = _options('POST')
        options.url = '/bill-runs'
        options.payload = {
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk'
        }
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
        options = _options('GET')
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
        options = _options('GET', 'cancel')
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
        options = _options('POST', 'cancel')
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(SubmitCancelBillRunService, 'go').resolves()
        })

        it('redirects to the bill runs page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/billing/batch/list')
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

  describe('/bill-runs/{id}/review', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _options('GET', 'review')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(ReviewBillRunService, 'go').resolves(_reviewBillRunData())
        })

        it('returns a 200 response', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('two-part tariff')
          expect(response.payload).to.contain('Southern (Test replica)')
          expect(response.payload).to.contain('Showing all 2 licences')
        })
      })
    })

    describe('POST /bill-runs/{id}/review', () => {
      beforeEach(async () => {
        options = _options('POST', 'review')
      })

      describe('when a request is valid', () => {
        describe('and no filters have been applied', () => {
          beforeEach(() => {
            Sinon.stub(ReviewBillRunService, 'go').resolves(_reviewBillRunData())
          })

          it('returns a 200 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('two-part tariff')
            expect(response.payload).to.contain('Southern (Test replica)')
            expect(response.payload).to.contain(
              'You need to review 1 licences with returns data issues. You can then continue and send the bill run.'
            )
            expect(response.payload).to.contain('Showing all 2 licences')
          })
        })

        describe('and a filter has been applied', () => {
          beforeEach(() => {
            const reviewBillRunData = _reviewBillRunData()

            // edit the data to represent a filter being applied
            reviewBillRunData.filter = { openFilter: true, licenceHolder: 'big' }
            reviewBillRunData.numberOfLicencesDisplayed = 1

            Sinon.stub(ReviewBillRunService, 'go').resolves(reviewBillRunData)
          })

          it('returns a 200 response', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('two-part tariff')
            expect(response.payload).to.contain('Southern (Test replica)')
            expect(response.payload).to.contain(
              'You need to review 1 licences with returns data issues. You can then continue and send the bill run.'
            )
            expect(response.payload).to.contain('Showing 1 of 2 licences')
          })
        })
      })
    })
  })

  describe('/bill-runs/{id}/review/{licenceId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _options('GET', 'review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e')
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
  })

  describe('/bill-runs/{id}/send', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _options('GET', 'send')
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
        options = _options('POST', 'send')
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
})

function _options (method, path) {
  const root = '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28'
  const url = path ? `${root}/${path}` : root

  return {
    method,
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
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
