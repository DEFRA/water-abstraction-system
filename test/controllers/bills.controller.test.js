'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ViewBillService = require('../../app/services/bills/view-bill.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bills controller', () => {
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

  describe('GET /bills', () => {
    const options = {
      method: 'GET',
      url: '/bills/64924759-8142-4a08-9d1e-1e902cd9d316',
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(ViewBillService, 'go').resolves({
          accountName: 'Wessex Water Services Ltd',
          accountNumber: 'E88888888A',
          addressLines: ['86 Oxford Road', 'WOOTTON', 'COURTENAY', 'TA24 8NX'],
          billId: '64924759-8142-4a08-9d1e-1e902cd9d316',
          billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
          billLicences: [
            {
              id: 'e37320ba-10c8-4954-8bc4-6982e56ded41',
              reference: '01/735',
              total: '£6,222.18'
            },
            {
              id: '127377ea-24ea-4578-8b96-ef9a8625a313',
              reference: '01/466',
              total: '£7,066.55'
            },
            {
              id: 'af709c49-54ac-4a4f-a167-8b152c9f44fb',
              reference: '01/638',
              total: '£8,239.07'
            }
          ],
          billNumber: 'EAI0000007T',
          billRunId: '2c80bd22-a005-4cf4-a2a2-73812a9861de',
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
          financialYear: '2022 to 2023',
          flaggedForReissue: false,
          region: 'South West',
          tableCaption: '3 licences',
          total: '£213,178.00',
          transactionFile: 'nalei50002t'
        })
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
        expect(response.payload).to.contain('Bill for Wessex Water Services Ltd')
      })
    })
  })
})
