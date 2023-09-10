'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunModel = require('../../../../app/models/water/bill-run.model.js')

// Things we need to stub
const ChargingModuleCreateTransactionService = require('../../../../app/services/charging-module/create-transaction.service.js')

// Thing under test
const SendBillingTransactionsService = require('../../../../app/services/billing/supplementary/send-billing-transactions.service.js')

describe('Send billing transactions service', () => {
  const billRunExternalId = '4f3710ca-75b1-4828-8fe9-f7c1edecbbf3'
  const bill = { invoiceAccountNumber: 'ABC123' }
  const billLicence = { billingInvoiceLicenceId: '594fc25e-99c1-440a-8b88-b507ee17738a' }
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  const licence = {
    historicalAreaCode: 'DALES',
    licenceRef: 'AT/CURR/MONTHLY/02',
    regionalChargeArea: 'Yorkshire',
    region: { chargeRegionId: 'N' }
  }
  const transaction = {
    billingTransactionId: '9b092372-1a26-436a-bf1f-b5eb3f9aca44',
    chargeElementId: '32058a19-4813-4ee7-808b-a0559deb8469',
    startDate: new Date('2022-04-01'),
    endDate: new Date('2022-10-31'),
    source: 'non-tidal',
    season: 'all year',
    loss: 'low',
    isCredit: false,
    chargeType: 'standard',
    authorisedQuantity: 6.82,
    billableQuantity: 6.82,
    authorisedDays: 365,
    billableDays: 214,
    status: 'candidate',
    description: 'Water abstraction charge: Mineral washing',
    volume: 6.82,
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: false,
    isNewLicence: false,
    isTwoPartSecondPartCharge: false,
    scheme: 'sroc',
    aggregateFactor: 0.562114443,
    adjustmentFactor: 1,
    chargeCategoryCode: '4.4.5',
    chargeCategoryDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
    isSupportedSource: false,
    supportedSourceName: null,
    isWaterCompanyCharge: true,
    isWinterOnly: false,
    isWaterUndertaker: false
  }

  let billingTransactions

  beforeEach(() => {
    billingTransactions = [transaction]
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when calling the Charging Module API is successful', () => {
    beforeEach(async () => {
      Sinon.stub(ChargingModuleCreateTransactionService, 'go').resolves({
        succeeded: true,
        response: {
          body: { transaction: { id: '7e752fa6-a19c-4779-b28c-6e536f028795' } }
        }
      })
    })

    it('updates the transactions with the responses from the Charging Module API', async () => {
      const results = await SendBillingTransactionsService.go(
        licence,
        bill,
        billLicence,
        billRunExternalId,
        billingTransactions,
        billingPeriod
      )

      expect(results).length(1)
      expect(results[0].status).to.equal('charge_created')
      expect(results[0].externalId).to.equal('7e752fa6-a19c-4779-b28c-6e536f028795')
      expect(results[0].billingInvoiceLicenceId).to.equal(billLicence.billingInvoiceLicenceId)
    })
  })

  describe('when calling the Charging Module API is unsuccessful', () => {
    beforeEach(async () => {
      Sinon.stub(ChargingModuleCreateTransactionService, 'go').rejects()
    })

    it('throws a BillRunError with the correct code', async () => {
      const error = await expect(
        SendBillingTransactionsService.go(
          licence,
          bill,
          billLicence,
          billRunExternalId,
          billingTransactions,
          billingPeriod
        )
      )
        .to
        .reject()

      expect(error).to.be.an.instanceOf(BillRunError)
      expect(error.code).to.equal(BillRunModel.errorCodes.failedToCreateCharge)
    })
  })
})
