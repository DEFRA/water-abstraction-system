'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { currentFinancialYear } = require('../../../support/helpers/general.helper.js')

// Things we need to stub
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargingModuleCreateTransactionService = require('../../../../app/services/charging-module/create-transaction.service.js')
const GenerateTransactionsService = require('../../../../app/services/bill-runs/generate-transactions.service.js')

// Thing under test
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/annual/process-billing-period.service.js')

describe('Annual Process billing period service', () => {
  const billingPeriod = currentFinancialYear()
  const billRun = {
    id: '8e0d4c8b-e9fe-4238-8f3e-dfca743316ef',
    externalId: 'f6e052f5-37f9-43f3-a649-ff6398cec1a3'
  }

  let billingAccount
  let chargingModuleCreateTransactionServiceStub

  beforeEach(async () => {
    // NOTE: Although we don't rely on the helpers to create the data we pass into the service it does persist the
    // results. If we don't clean the DB it causes the tests to fail because of unique constraints on the legacy tables.
    await DatabaseHelper.clean()

    chargingModuleCreateTransactionServiceStub = Sinon.stub(ChargingModuleCreateTransactionService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe('and there are no billing accounts to process', () => {
      it('returns false (bill run is empty)', async () => {
        const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [])

        expect(result).to.be.false()
      })
    })

    describe('and there are billing accounts to process', () => {
      describe('and they are billable', () => {
        beforeEach(async () => {
          billingAccount = _testBillingAccount()

          // We want to ensure there is coverage of the functionality that finds an existing bill licence or creates a
          // new one when processing a billing account. To to that we need a billing account with 2 charge versions
          // linked to the same licence
          billingAccount.chargeVersions = [_testChargeVersion(billingAccount.id), _testChargeVersion(billingAccount.id)]

          chargingModuleCreateTransactionServiceStub.onFirstCall().resolves({
            ..._chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
          })
          chargingModuleCreateTransactionServiceStub.onSecondCall().resolves({
            ..._chargingModuleResponse('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
          })
        })

        it('returns true (bill run is not empty)', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.true()
        })
      })

      describe('but they are not billable', () => {
        beforeEach(async () => {
          billingAccount = _testBillingAccount()
          const chargeVersion = _testChargeVersion(billingAccount.id)

          // We update the billing account's charge information so that the engine calculates a charge period that
          // starts after the abstraction period i.e. nothing to bill
          chargeVersion.startDate = new Date(billingPeriod.endDate.getFullYear(), 7, 1)
          chargeVersion.chargeReferences[0].chargeElements[0].abstractionPeriodEndMonth = 5

          billingAccount.chargeVersions = [chargeVersion]
        })

        it('returns false (bill run is empty)', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.false()
        })
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(async () => {
      billingAccount = _testBillingAccount()
      billingAccount.chargeVersions = [_testChargeVersion(billingAccount.id)]
    })

    describe('because generating the calculated transactions fails', () => {
      beforeEach(async () => {
        Sinon.stub(GenerateTransactionsService, 'go').throws()
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount]))
          .to
          .reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
      })
    })

    describe('because sending the transactions fails', () => {
      beforeEach(async () => {
        chargingModuleCreateTransactionServiceStub.rejects()
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount]))
          .to
          .reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToCreateCharge)
      })
    })
  })
})

function _chargingModuleResponse (transactionId) {
  return {
    succeeded: true,
    response: {
      body: { transaction: { id: transactionId } }
    }
  }
}

function _testBillingAccount () {
  return {
    id: '973a5852-9c06-4c14-b1e2-d32b88d3e878',
    accountNumber: 'T71117364A'
  }
}

function _testChargeVersion (billingAccountId) {
  return {
    id: generateUUID(),
    scheme: 'sroc',
    startDate: new Date('2022-04-01'),
    endDate: null,
    billingAccountId,
    status: 'current',
    licence: {
      id: '1b605a4e-a065-4b17-80eb-47179b99a4e8',
      licenceRef: '01/684',
      waterUndertaker: true,
      historicalAreaCode: 'SAAR',
      regionalChargeArea: 'Southern',
      startDate: new Date('2022-01-01'),
      expiredDate: null,
      lapsedDate: null,
      revokedDate: null,
      region: {
        id: '03d3a38b-0213-43eb-9ab4-d83f26d3b111',
        chargeRegionId: 'A'
      }
    },
    changeReason: {
      id: '9107791e-b4b2-481c-b768-fb66d0b5d22e',
      triggersMinimumCharge: false
    },
    chargeReferences: [
      {
        id: generateUUID(),
        source: 'non-tidal',
        loss: 'low',
        volume: '6.819',
        adjustments: {
          s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: '0.562114443'
        },
        additionalCharges: { isSupplyPublicWater: true },
        description: 'Mineral washing',
        chargeCategory: {
          id: 'cc4a66da-efdb-4882-b18a-daf000131349',
          reference: '4.4.1',
          shortDescription: 'Low loss, non-tidal, up to and including 5,000 ML/yr'
        },
        chargeElements: [
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            // NOTE: We are faking an Objection model which comes with a toJSON() method that gets called as part
            // of processing the billing account.
            toJSON: () => { return '{}' }
          }
        ]
      }
    ]
  }
}
