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
const CancelBillRunConfirmationService = require('../../app/services/bill-runs/cancel-bill-run-confirmation.service.js')
const ReviewLicenceService = require('../../app/services/bill-runs/two-part-tariff/review-licence.service.js')
const ReviewBillRunService = require('../../app/services/bill-runs/two-part-tariff/review-bill-run.service.js')
const StartBillRunProcessService = require('../../app/services/bill-runs/start-bill-run-process.service.js')
const ViewBillRunService = require('../../app/services/bill-runs/view-bill-run.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs controller', () => {
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

  describe('POST /bill-runs', () => {
    let options

    beforeEach(() => {
      options = {
        method: 'POST',
        url: '/bill-runs',
        payload: {
          type: 'supplementary',
          scheme: 'sroc',
          region: '07ae7f3a-2677-4102-b352-cc006828948c',
          user: 'test.user@defra.gov.uk'
        },
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
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

      beforeEach(() => {
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
        beforeEach(() => {
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

  describe('GET /bill-runs/{id}', () => {
    let options

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
    })

    describe('when the request succeeds', () => {
      describe('and it is for a bill run with multiple bill groups', () => {
        beforeEach(() => {
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
        beforeEach(() => {
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

  describe('GET /bill-runs/{id}/cancel', () => {
    let options

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/cancel',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }

      Sinon.stub(CancelBillRunConfirmationService, 'go').resolves({
        dateCreated: '20 February 2024',
        region: 'Southern (Test replica)',
        billRunType: 'Two-part tariff',
        financialYear: '2022 to 2023',
        billRunBatchType: 'two_part_tariff',
        chargingModuleBillRunId: 'ee5adf04-3bc6-4c18-9e68-aaa6cde611ff'
      })
    })

    describe('when the request succeeds', () => {
      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('20 February 2024')
        expect(response.payload).to.contain('Southern (Test replica)')
        expect(response.payload).to.contain('Two-part tariff')
        expect(response.payload).to.contain('2022 to 2023')
        expect(response.payload).to.contain('two_part_tariff')
        expect(response.payload).to.contain('ee5adf04-3bc6-4c18-9e68-aaa6cde611ff')
      })
    })
  })

  describe('POST /bill-runs/{id}/cancel', () => {
    let options

    beforeEach(() => {
      options = {
        method: 'POST',
        url: '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/cancel',
        payload: {
          billRunBatchType: 'two_part_tariff',
          chargingModuleBillRunId: 'ee5adf04-3bc6-4c18-9e68-aaa6cde611ff'
        },
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
    })

    describe('when a request is valid', () => {
      let cancelStub

      beforeEach(() => {
        cancelStub = Sinon.stub(CancelBillRunService, 'go').resolves()
      })

      it('cancels the bill run, returns a 302 response and redirects to the Bill runs page', async () => {
        const response = await server.inject(options)
        const { billRunBatchType, chargingModuleBillRunId } = options.payload

        expect(cancelStub.calledWith(
          '97db1a27-8308-4aba-b463-8a6af2558b28',
          billRunBatchType,
          chargingModuleBillRunId
        )).to.be.true()

        expect(response.statusCode).to.equal(302)
        expect(response.headers.location).to.equal('/billing/batch/list')
      })
    })

    describe('when the request fails because the `CancelBillRunService` throws an error', () => {
      let notifierStub
      beforeEach(() => {
        Sinon.stub(CancelBillRunService, 'go').throws()

        notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
        global.GlobalNotifier = notifierStub
      })

      it('returns an error response', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(302)
        expect(notifierStub.omfg.calledWith('Failed to cancel bill run', { id: '97db1a27-8308-4aba-b463-8a6af2558b28' })).to.be.true()
        expect(response.headers.location).to.equal('/billing/batch/list')
      })
    })
  })

  describe('GET /bill-runs/{id}/review', () => {
    let options

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
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
        expect(response.payload).to.contain('Showing all 1 licences')
      })
    })
  })

  describe('GET /bill-runs/{id}/review/{licenceId}', () => {
    let options

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28/review/cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
        auth: {
          strategy: 'session',
          credentials: { scope: ['billing'] }
        }
      }
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

function _licenceReviewData () {
  return {
    licenceRef: '1/11/10/*S/0084',
    billRunId: '97db1a27-8308-4aba-b463-8a6af2558b28',
    status: 'review',
    region: 'Southern (Test replica)',
    matchedReturns: [
      {
        reference: '11142960',
        dates: '1 November 2021 to 31 October 2022',
        status: 'completed',
        description: 'Test Road. Points 1 and 2.',
        purpose: 'Spray Irrigation - Anti Frost',
        total: '0 ML / 0 ML',
        allocated: 'Fully allocated'
      },
      {
        reference: '11142958',
        dates: '1 November 2022 to 31 October 2023',
        status: 'void',
        description: 'Test Road. Points 1, 3 and 5.',
        purpose: 'Spray Irrigation - Direct',
        total: '/',
        allocated: 'Not processed'
      }
    ],
    chargePeriodDates: ['1 April 2022 to 31 March 2023'],
    unmatchedReturns: []
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
    ]
  }
}

function _reviewBillRunData () {
  return {
    region: 'Southern (Test replica)',
    status: 'review',
    dateCreated: '6 November 2023',
    financialYear: '2021 to 2022',
    chargeScheme: 'Current',
    billRunType: 'two-part tariff',
    numberOfLicences: 1,
    licencesToReviewCount: 1,
    licences: [
      {
        licenceId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
        licenceRef: '1/11/11/*1/1111',
        licenceHolder: 'Big Farm Ltd',
        licenceIssues: 'Multiple Issues',
        licenceStatus: 'review'
      }
    ]
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
    ]
  }
}
