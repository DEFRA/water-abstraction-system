'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const ChargeCategoryHelper = require('../../../support/helpers/charge-category.helper.js')
const { determineCurrentFinancialYear, generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const BillModel = require('../../../../app/models/bill.model.js')
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargingModuleCreateTransactionRequest = require('../../../../app/requests/charging-module/create-transaction.request.js')
const GenerateTransactionsService = require('../../../../app/services/bill-runs/generate-transactions.service.js')

// Thing under test
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/annual/process-billing-period.service.js')

describe('Annual Process billing period service', () => {
  const billingPeriod = determineCurrentFinancialYear()

  let billRun
  let billingAccount
  let chargingModuleCreateTransactionRequestStub

  beforeEach(async () => {
    // NOTE: Although we don't rely on the helpers to create the data we pass into the service it does persist the
    // results. If we don't clean the DB it causes the tests to fail because of unique constraints on the legacy tables.
    // await DatabaseSupport.clean()

    chargingModuleCreateTransactionRequestStub = Sinon.stub(ChargingModuleCreateTransactionRequest, 'send')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe('and there are no billing accounts to process', () => {
      beforeEach(() => {
        billRun = _billRun()
      })

      it('returns false (bill run is empty)', async () => {
        const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [])

        expect(result).to.be.false()
      })
    })

    describe('and there are billing accounts to process', () => {
      beforeEach(async () => {
        chargingModuleCreateTransactionRequestStub.onFirstCall().resolves({
          ..._chargingModuleResponse(generateUUID())
        })
        chargingModuleCreateTransactionRequestStub.onSecondCall().resolves({
          ..._chargingModuleResponse(generateUUID())
        })
      })

      describe('and they are billable', () => {
        beforeEach(async () => {
          billRun = _billRun()
          billingAccount = _billingAccount()

          // We want to ensure there is coverage of the functionality that finds an existing bill licence or creates a
          // new one when processing a billing account. To to that we need a billing account with 2 charge versions
          // linked to the same licence
          billingAccount.chargeVersions = [_chargeVersion(billingAccount.id), _chargeVersion(billingAccount.id)]
        })

        it('returns true (bill run is not empty)', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.true()
        })
      })

      describe('and they are partially billable (some bill licences generate 0 transactions)', () => {
        beforeEach(() => {
          billRun = _billRun()
          billingAccount = _billingAccount()

          // Create a charge version with an abstraction period that starts in June but which is linked to a licence
          // that was revoked at the start of May. The engine should calculate 0 billable days and therefore not attempt
          // to create a bill licence for this record.
          const unbillableChargeVersion = _chargeVersion(billingAccount.id)

          unbillableChargeVersion.licence.id = generateUUID()
          unbillableChargeVersion.licence.revokedDate = new Date(billingPeriod.startDate.getFullYear(), 4, 1)
          unbillableChargeVersion.chargeReferences[0].chargeElements[0].abstractionPeriodStartDay = 1
          unbillableChargeVersion.chargeReferences[0].chargeElements[0].abstractionPeriodStartMonth = 6

          billingAccount.chargeVersions = [
            _chargeVersion(billingAccount.id),
            unbillableChargeVersion
          ]
        })

        it('returns true (bill run is not empty) and only persists the bill licences with transactions', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.true()

          const bill = await BillModel.query().findOne('billRunId', billRun.id).withGraphFetched('billLicences')

          expect(bill.billLicences.length).to.equal(1)
          expect(bill.billLicences[0].licenceId).to.equal(billingAccount.chargeVersions[0].licence.id)
        })
      })

      describe('but they are not billable', () => {
        beforeEach(async () => {
          billRun = _billRun()
          billingAccount = _billingAccount()

          const chargeVersion = _chargeVersion(billingAccount.id)

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
      billRun = _billRun()
      billingAccount = _billingAccount()
      billingAccount.chargeVersions = [_chargeVersion(billingAccount.id)]
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
        chargingModuleCreateTransactionRequestStub.rejects()
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

function _billRun () {
  return {
    id: generateUUID(),
    externalId: generateUUID()
  }
}

function _chargingModuleResponse (transactionId) {
  return {
    succeeded: true,
    response: {
      body: { transaction: { id: transactionId } }
    }
  }
}

function _billingAccount () {
  return {
    id: generateUUID(),
    accountNumber: BillingAccountHelper.generateAccountNumber()
  }
}

function _chargeVersion (billingAccountId) {
  return {
    id: generateUUID(),
    scheme: 'sroc',
    startDate: new Date('2022-04-01'),
    endDate: null,
    billingAccountId,
    status: 'current',
    licence: {
      id: generateUUID(),
      licenceRef: LicenceHelper.generateLicenceRef(),
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
          id: generateUUID(),
          reference: ChargeCategoryHelper.generateChargeReference(),
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
