'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ViewBillLicenceService = require('../../app/services/bill-licences/view-bill-licence.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Licences controller', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
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

  describe('GET /bill-licences', () => {
    const options = {
      method: 'GET',
      url: '/bill-licences/64924759-8142-4a08-9d1e-1e902cd9d316',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      describe('and is for a PRESROC bill licence', () => {
        beforeEach(async () => {
          Sinon.stub(ViewBillLicenceService, 'go').resolves(_presrocPageData())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Transactions for WA/055/0017/999')

          // Only the presroc view has this data attribute tag
          expect(response.payload).to.contain('data-test="charge-element-season-0"')
        })
      })

      describe('and is for an SROC bill licence', () => {
        beforeEach(async () => {
          Sinon.stub(ViewBillLicenceService, 'go').resolves(_srocPageData())
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Transactions for 03/28/72/0099/1')

          // Only the SROC view has this data attribute tag
          expect(response.payload).to.contain('data-test="charge-reference-0"')
        })
      })
    })
  })
})

function _presrocPageData () {
  return {
    accountNumber: 'W99999999A',
    billId: '5a5b313b-e707-490a-a693-799339941e4f',
    creditTotal: '£0.00',
    debitTotal: '£100.37',
    displayCreditDebitTotals: true,
    licenceId: '2eaa831d-7bd6-4b0a-aaf1-3aacafec6bf2',
    licenceRef: 'WA/055/0017/999',
    scheme: 'alcs',
    tableCaption: '2 transactions',
    total: '£100.37',
    transactions: [
      {
        agreement: null,
        billableDays: '123/123',
        chargeElement: {
          purpose: 'Spray Irrigation - Direct',
          abstractionPeriod: '1 May to 31 August',
          source: 'Unsupported',
          season: 'Summer',
          loss: 'High'
        },
        chargePeriod: '1 April 2021 to 31 March 2022',
        chargeType: 'standard',
        creditAmount: '',
        debitAmount: '£100.37',
        description: 'River Watery at Jenny Barrow, Whitchurch',
        quantity: '12ML'
      },
      {
        agreement: null,
        billableDays: '123/123',
        chargePeriod: '1 April 2021 to 31 March 2022',
        chargeType: 'compensation',
        creditAmount: '',
        debitAmount: '£0.00',
        description: 'Compensation charge',
        quantity: '12ML'
      }
    ]
  }
}

function _srocPageData () {
  return {
    accountNumber: 'B99990099A',
    billId: '13822096-1118-404c-81a4-fdbe5fb73d8f',
    creditTotal: '£0.00',
    debitTotal: '£1,253.00',
    displayCreditDebitTotals: true,
    licenceId: 'a7a60a47-6d13-41ca-96f7-ea890f9c08e8',
    licenceRef: '03/28/72/0099/1',
    scheme: 'sroc',
    tableCaption: '2 transactions',
    total: '£1,253.00',
    transactions: [
      {
        additionalCharges: '',
        adjustments: 'Two-part tariff (0.5)',
        billableDays: '214/214',
        chargeCategoryDescription: 'High loss, non-tidal, restricted water, greater than 120 up to and including 220 ML/yr, Tier 1 model',
        chargeElements: [{
          purpose: 'Trickle Irrigation - Direct',
          abstractionPeriod: '1 April to 31 October',
          volume: '150ML'
        }],
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargeReference: '4.6.29 (£35.74)',
        chargeType: 'standard',
        creditAmount: '',
        debitAmount: '£1,787.00',
        description: 'Two-part tariff basic water abstraction charge: Borehole at Muckton - Sussex',
        quantity: '150ML'
      },
      {
        billableDays: '214/214',
        chargePeriod: '1 April 2023 to 31 March 2024',
        chargeType: 'compensation',
        creditAmount: '',
        debitAmount: '£0.00',
        description: 'Compensation charge',
        quantity: '150ML'
      }
    ]
  }
}
