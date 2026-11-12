// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'
import { generateLicenceRef } from 'water-abstraction-engine/test/generators.js'
import BillRunError from '../../../src/errors/bill-run.error.js'

// Things we need to stub
import * as ChargingModuleCreateTransactionRequest from '../../../src/requests/charging-module/create-transaction.request.js'

// Thing under test
import SendTransactionsService from '../../../src/services/bill-runs/send-transactions.service.js'

describe('Bill Runs - Send Transactions service', () => {
  const accountNumber = 'ABC123'
  const billRunExternalId = '4f3710ca-75b1-4828-8fe9-f7c1edecbbf3'
  const licence = {
    historicalAreaCode: 'DALES',
    licenceRef: generateLicenceRef(),
    region: { chargeRegionId: 'N' },
    regionalChargeArea: 'Yorkshire'
  }

  let chargingModuleCreateTransactionRequestStub
  let transactions

  beforeEach(() => {
    chargingModuleCreateTransactionRequestStub = vi
      .spyOn(ChargingModuleCreateTransactionRequest, 'default')
      .mockImplementation(() => {})

    transactions = [
      _transaction('fca14c7e-c895-4991-9651-9a76f45b971d'),
      _transaction('e98ad67f-5a26-43d7-bdba-39eba49ab62c')
    ]
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when calling the Charging Module API is successful', () => {
    beforeEach(async () => {
      chargingModuleCreateTransactionRequestStub.mockResolvedValueOnce({
        ..._chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
      })
      chargingModuleCreateTransactionRequestStub.mockResolvedValueOnce({
        ..._chargingModuleResponse('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
      })
    })

    it('updates the transactions with the responses from the Charging Module API', async () => {
      const results = await SendTransactionsService(transactions, billRunExternalId, accountNumber, licence)

      expect(results).toHaveLength(2)
      expect(results[0].status).toEqual('charge_created')
      expect(results[0].externalId).toEqual('7e752fa6-a19c-4779-b28c-6e536f028795')
      expect(results[1].status).toEqual('charge_created')
      expect(results[1].externalId).toEqual('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
    })
  })

  describe('when calling the Charging Module API is unsuccessful', () => {
    beforeEach(async () => {
      chargingModuleCreateTransactionRequestStub.mockResolvedValueOnce({
        ..._chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
      })
      chargingModuleCreateTransactionRequestStub.mockRejectedValueOnce()
    })

    it('throws a BillRunError with the correct code', async () => {
      await expect(
        SendTransactionsService(transactions, billRunExternalId, accountNumber, licence)
      ).rejects.toBeInstanceOf(BillRunError)

      await expect(
        SendTransactionsService(transactions, billRunExternalId, accountNumber, licence)
      ).rejects.toMatchObject({ code: BillRunModel.errorCodes.failedToCreateCharge })
    })
  })
})

function _transaction(transactionId) {
  return {
    adjustmentFactor: 1,
    aggregateFactor: 0.562114443,
    authorisedDays: 365,
    authorisedQuantity: 6.82,
    billableDays: 214,
    billableQuantity: 6.82,
    chargeCategoryCode: '4.4.5',
    chargeCategoryDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
    chargeReferenceId: '32058a19-4813-4ee7-808b-a0559deb8469',
    chargeType: 'standard',
    credit: false,
    description: 'Water abstraction charge: Mineral washing',
    endDate: new Date('2022-10-31'),
    id: transactionId,
    loss: 'low',
    newLicence: false,
    scheme: 'sroc',
    season: 'all year',
    section126Factor: 1,
    section127Agreement: false,
    section130Agreement: false,
    source: 'non-tidal',
    startDate: new Date('2022-04-01'),
    status: 'candidate',
    supportedSource: false,
    supportedSourceName: null,
    twoPartSecondPartCharge: false,
    volume: 6.82,
    waterCompanyCharge: true,
    waterUndertaker: false,
    winterOnly: false
  }
}

function _chargingModuleResponse(transactionId) {
  return {
    response: {
      body: { transaction: { id: transactionId } }
    },
    succeeded: true
  }
}
