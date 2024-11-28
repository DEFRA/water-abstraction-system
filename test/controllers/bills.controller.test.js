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
const RemoveBillService = require('../../app/services/bills/remove-bill.service.js')
const SubmitRemoveBillService = require('../../app/services/bills/submit-remove-bill.service.js')
const ViewBillService = require('../../app/services/bills/view-bill.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bills controller', () => {
  const rootPath = '/bills/64924759-8142-4a08-9d1e-1e902cd9d316'

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

  describe('/bills', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: rootPath,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }
      })

      describe('when the request succeeds', () => {
        describe('and it is for a bill with multiple licences', () => {
          beforeEach(async () => {
            Sinon.stub(ViewBillService, 'go').resolves(_testMultiLicenceBill())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Bill for Mr B Blobby')
            expect(response.payload).to.contain('2 licences')
          })
        })

        describe('and it is for a bill with a single licence', () => {
          beforeEach(async () => {
            Sinon.stub(ViewBillService, 'go').resolves(_testSingleLicenceBill())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Bill for Mr B Blobby')
            expect(response.payload).to.contain('2 transactions')
            expect(response.payload).to.contain('Current')
          })
        })

        describe('and it is for a bill with a single licence pre sroc', () => {
          beforeEach(async () => {
            Sinon.stub(ViewBillService, 'go').resolves(_testSingleLicenceBillPreSroc())
          })

          it('returns the page successfully', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(200)
            expect(response.payload).to.contain('Bill for Mr B Blobby')
            expect(response.payload).to.contain('2 transactions')
            expect(response.payload).to.contain('Old')
          })
        })
      })
    })
  })

  describe('/bill/{billId}/remove', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: `${rootPath}/remove`,
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }

        Sinon.stub(RemoveBillService, 'go').resolves({
          pageTitle: "You're about to remove the bill for T65757520A from the bill run"
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('about to remove the bill for T65757520A from the bill run')
        })
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        options = postRequestOptions(`${rootPath}/remove`)
      })

      describe('when a request is valid', () => {
        beforeEach(() => {
          Sinon.stub(SubmitRemoveBillService, 'go').resolves(
            '/billing/batch/c04ea618-d1ad-494b-bdc4-1bfa670876d0/processing'
          )
        })

        it('redirects to the legacy processing bill run page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/billing/batch/c04ea618-d1ad-494b-bdc4-1bfa670876d0/processing')
        })
      })

      describe('when the request fails', () => {
        describe('because the removing service threw an error', () => {
          beforeEach(async () => {
            Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
            Sinon.stub(SubmitRemoveBillService, 'go').rejects()
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

function _testMultiLicenceBill() {
  return {
    accountName: 'Mr B Blobby',
    accountNumber: 'E99999999A',
    addressLines: ['C/O Noel Edmonds', 'Crinkley Bottom', 'Cricket St Thomas', 'Somerset', 'TA20 1KL'],
    billId: '64924759-8142-4a08-9d1e-1e902cd9d316',
    billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
    billNumber: 'EAI9999999T',
    billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
    billRunNumber: 10003,
    billRunStatus: 'sent',
    billRunType: 'Annual',
    chargeScheme: 'Current',
    contactName: null,
    credit: false,
    creditsTotal: '£0.00',
    dateCreated: '7 March 2023',
    debitsTotal: '£213,178.00',
    deminimis: false,
    displayCreditDebitTotals: false,
    financialYear: '2023 to 2023',
    flaggedForReissue: false,
    region: 'South West',
    total: '£213,178.00',
    transactionFile: 'nalei50002t',
    billLicences: [
      {
        id: '6eff32eb-7c78-478a-8c8f-fb4d0451c359',
        reference: '17/99/001/G/999',
        total: '£2,889.00'
      },
      {
        id: '09818dfd-9903-4180-9a2e-e7e72a9e66bb',
        reference: '17/99/001/G/998',
        total: '£70,709.00'
      }
    ],
    tableCaption: '2 licences'
  }
}

function _testSingleLicenceBill() {
  return {
    accountName: 'Mr B Blobby',
    accountNumber: 'E99999999A',
    addressLines: ['C/O Noel Edmonds', 'Crinkley Bottom', 'Cricket St Thomas', 'Somerset', 'TA20 1KL'],
    billId: '8b8b8831-d671-4456-93cd-30310e6fdf7a',
    billingAccountId: '7771d5a3-305c-4564-8167-74ba0cc4f08e',
    billNumber: 'EAI9999999T',
    billRunId: '420e948f-1992-437e-8a47-74c0066cb017',
    billRunNumber: 10010,
    billRunStatus: 'sent',
    billRunType: 'Supplementary',
    chargeScheme: 'Current',
    contactName: null,
    credit: false,
    creditsTotal: '£0.00',
    dateCreated: '1 November 2023',
    debitsTotal: '£1,162.00',
    deminimis: false,
    displayCreditDebitTotals: true,
    financialYear: '2023 to 2024',
    flaggedForReissue: false,
    region: 'South West',
    total: '£1,162.00',
    transactionFile: 'nalei50002t',
    creditTotal: '£0.00',
    debitTotal: '£1,162.00',
    licenceId: '6d4236b2-add7-4446-9472-6ffc98b0ded1',
    licenceRef: '17/99/001/G/999',
    scheme: 'sroc',
    tableCaption: '2 transactions',
    transactions: [
      {
        additionalCharges: '',
        adjustments: '',
        billableDays: '214/214',
        chargeCategoryDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
        chargeElements: [
          {
            purpose: 'Trickle Irrigation - Direct',
            abstractionPeriod: '1 April to 31 October',
            volume: '21.474ML'
          }
        ],
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargeReference: '4.5.13 (£11.62)',
        chargeType: 'standard',
        creditAmount: '',
        debitAmount: '£1,162.00',
        description: 'Water abstraction charge: Original',
        quantity: '100ML'
      },
      {
        billableDays: '214/214',
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargeType: 'compensation',
        creditAmount: '',
        debitAmount: '£0.00',
        description: 'Compensation charge',
        quantity: '100ML'
      }
    ],
    transactionsTotal: '£1,162.00'
  }
}

function _testSingleLicenceBillPreSroc() {
  return {
    accountName: 'Mr B Blobby',
    accountNumber: 'E99999999A',
    addressLines: ['C/O Noel Edmonds', 'Crinkley Bottom', 'Cricket St Thomas', 'Somerset', 'TA20 1KL'],
    billId: '8b8b8831-d671-4456-93cd-30310e6fdf7a',
    billingAccountId: '7771d5a3-305c-4564-8167-74ba0cc4f08e',
    billNumber: 'EAI9999999T',
    billRunId: '420e948f-1992-437e-8a47-74c0066cb017',
    billRunNumber: 10010,
    billRunStatus: 'sent',
    billRunType: 'Supplementary',
    chargeScheme: 'Old',
    contactName: null,
    credit: false,
    creditsTotal: '£0.00',
    dateCreated: '1 November 2023',
    debitsTotal: '£1,162.00',
    deminimis: false,
    displayCreditDebitTotals: true,
    financialYear: '2023 to 2024',
    flaggedForReissue: false,
    region: 'South West',
    total: '£1,162.00',
    transactionFile: 'nalei50002t',
    creditTotal: '£0.00',
    debitTotal: '£1,162.00',
    licenceId: '6d4236b2-add7-4446-9472-6ffc98b0ded1',
    licenceRef: '17/99/001/G/999',
    scheme: 'alcs',
    tableCaption: '2 transactions',
    transactions: [
      {
        additionalCharges: '',
        adjustments: '',
        billableDays: '214/214',
        chargeCategoryDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
        chargeElements: [
          {
            purpose: 'Trickle Irrigation - Direct',
            abstractionPeriod: '1 April to 31 October',
            volume: '21.474ML'
          }
        ],
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargeReference: '4.5.13 (£11.62)',
        chargeType: 'standard',
        creditAmount: '',
        debitAmount: '£1,162.00',
        description: 'Water abstraction charge: Original',
        quantity: '100ML'
      },
      {
        billableDays: '214/214',
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargeType: 'compensation',
        creditAmount: '',
        debitAmount: '£0.00',
        description: 'Compensation charge',
        quantity: '100ML'
      }
    ],
    transactionsTotal: '£1,162.00'
  }
}
