'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunError = require('../../../app/errors/bill-run.error.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')

// Things we need to stub
const ChargingModuleCreateTransactionRequest = require('../../../app/requests/charging-module/create-transaction.request.js')

// Thing under test
const SendTransactionsService = require('../../../app/services/bill-runs/send-transactions.service.js')

describe('Send Transactions service', () => {
  const accountNumber = 'ABC123'
  const billRunExternalId = '4f3710ca-75b1-4828-8fe9-f7c1edecbbf3'
  const licence = {
    historicalAreaCode: 'DALES',
    licenceRef: 'AT/CURR/MONTHLY/02',
    regionalChargeArea: 'Yorkshire',
    region: { chargeRegionId: 'N' }
  }

  let chargingModuleCreateTransactionRequestStub
  let transactions

  beforeEach(() => {
    chargingModuleCreateTransactionRequestStub = Sinon.stub(ChargingModuleCreateTransactionRequest, 'send')

    transactions = [
      _transaction('fca14c7e-c895-4991-9651-9a76f45b971d'),
      _transaction('e98ad67f-5a26-43d7-bdba-39eba49ab62c')
    ]
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when calling the Charging Module API is successful', () => {
    beforeEach(async () => {
      chargingModuleCreateTransactionRequestStub.onFirstCall().resolves({
        ..._chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
      })
      chargingModuleCreateTransactionRequestStub.onSecondCall().resolves({
        ..._chargingModuleResponse('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
      })
    })

    it('updates the transactions with the responses from the Charging Module API', async () => {
      const results = await SendTransactionsService.go(transactions, billRunExternalId, accountNumber, licence)

      expect(results).length(2)
      expect(results[0].status).to.equal('charge_created')
      expect(results[0].externalId).to.equal('7e752fa6-a19c-4779-b28c-6e536f028795')
      expect(results[1].status).to.equal('charge_created')
      expect(results[1].externalId).to.equal('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
    })
  })

  describe('when calling the Charging Module API is unsuccessful', () => {
    beforeEach(async () => {
      chargingModuleCreateTransactionRequestStub.onFirstCall().resolves({
        ..._chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
      })
      chargingModuleCreateTransactionRequestStub.onSecondCall().rejects()
    })

    it('throws a BillRunError with the correct code', async () => {
      const error = await expect(
        SendTransactionsService.go(transactions, billRunExternalId, accountNumber, licence)
      ).to.reject()

      expect(error).to.be.an.instanceOf(BillRunError)
      expect(error.code).to.equal(BillRunModel.errorCodes.failedToCreateCharge)
    })
  })
})

function _transaction(transactionId) {
  return {
    id: transactionId,
    chargeReferenceId: '32058a19-4813-4ee7-808b-a0559deb8469',
    startDate: new Date('2022-04-01'),
    endDate: new Date('2022-10-31'),
    source: 'non-tidal',
    season: 'all year',
    loss: 'low',
    credit: false,
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
    newLicence: false,
    twoPartSecondPartCharge: false,
    scheme: 'sroc',
    aggregateFactor: 0.562114443,
    adjustmentFactor: 1,
    chargeCategoryCode: '4.4.5',
    chargeCategoryDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
    supportedSource: false,
    supportedSourceName: null,
    waterCompanyCharge: true,
    winterOnly: false,
    waterUndertaker: false
  }
}

function _chargingModuleResponse(transactionId) {
  return {
    succeeded: true,
    response: {
      body: { transaction: { id: transactionId } }
    }
  }
}
