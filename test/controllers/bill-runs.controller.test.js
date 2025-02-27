'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const Boom = require('@hapi/boom')
const IndexBillRunsService = require('../../app/services/bill-runs/index-bill-runs.service.js')
const SubmitCancelBillRunService = require('../../app/services/bill-runs/cancel/submit-cancel-bill-run.service.js')
const SubmitSendBillRunService = require('../../app/services/bill-runs/send/submit-send-bill-run.service.js')
const TwoPartTariffSupplementaryGenerateBillRunService = require('../../app/services/bill-runs/tpt-supplementary/generate-bill-run.service.js')
const TwoPartTariffAnnualGenerateBillRunService = require('../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js')
const ViewBillRunService = require('../../app/services/bill-runs/view-bill-run.service.js')
const ViewCancelBillRunService = require('../../app/services/bill-runs/cancel/view-cancel-bill-run.service.js')
const ViewSendBillRunService = require('../../app/services/bill-runs/send/view-send-bill-run.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs controller', () => {
  let options
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
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
            billRuns: [
              {
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
              }
            ],
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
          Sinon.stub(ViewCancelBillRunService, 'go').resolves({
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

  describe('/bill-runs/{id}/send', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions('send')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(ViewSendBillRunService, 'go').resolves({
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

  describe('/bill-runs/{id}/tpt-supplementary', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getRequestOptions('tpt-supplementary')
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(TwoPartTariffSupplementaryGenerateBillRunService, 'go').resolves(
            '97db1a27-8308-4aba-b463-8a6af2558b28'
          )
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
            Sinon.stub(TwoPartTariffSupplementaryGenerateBillRunService, 'go').rejects()
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
          Sinon.stub(TwoPartTariffAnnualGenerateBillRunService, 'go').resolves('97db1a27-8308-4aba-b463-8a6af2558b28')
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
            Sinon.stub(TwoPartTariffAnnualGenerateBillRunService, 'go').rejects()
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

function _getRequestOptions(path) {
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

function _postRequestOptions(path) {
  const root = '/bill-runs/97db1a27-8308-4aba-b463-8a6af2558b28'
  const url = path ? `${root}/${path}` : root

  return postRequestOptions(url)
}

function _multiGroupBillRun() {
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
        bills: [
          {
            id: '64924759-8142-4a08-9d1e-1e902cd9d316',
            accountNumber: 'E22288888A',
            billingContact: 'Acme Water Services Ltd',
            licences: ['17/53/001/A/101', '17/53/002/B/205', '17/53/002/C/308'],
            licencesCount: 3,
            financialYear: 2023,
            total: '£213,178.00'
          }
        ]
      },
      {
        type: 'other-abstractors',
        caption: '1 other abstractor',
        bills: [
          {
            id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
            accountNumber: 'E11101999A',
            billingContact: 'Geordie Leforge',
            licences: ['17/53/001/G/782'],
            licencesCount: 1,
            financialYear: 2023,
            total: '£97.00'
          }
        ]
      }
    ],
    view: 'bill-runs/view.njk'
  }
}

function _singleGroupBillRun() {
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
        bills: [
          {
            id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
            accountNumber: 'E11101999A',
            billingContact: 'Geordie Leforge',
            licences: ['17/53/001/G/782'],
            licencesCount: 1,
            financialYear: 2023,
            total: '£97.00'
          }
        ]
      }
    ],
    view: 'bill-runs/view.njk'
  }
}
