'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillModel = require('../../../../app/models/bill.model.js')
const { generateAccountNumber } = require('../../../support/helpers/billing-account.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Things we need to stub
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargingModuleCreateTransactionRequest = require('../../../../app/requests/charging-module/create-transaction.request.js')
const GenerateTwoPartTariffTransactionService = require('../../../../app/services/bill-runs/generate-two-part-tariff-transaction.service.js')

// Thing under test
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/two-part-tariff/process-billing-period.service.js')

describe('Bill Runs - Two-part Tariff - Process Billing Period service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let billRun
  let billingAccount
  let chargingModuleCreateTransactionRequestStub
  let licence

  beforeEach(async () => {
    billRun = {
      id: generateUUID(),
      externalId: generateUUID()
    }

    billingAccount = _billingAccount()

    licence = _licence()

    chargingModuleCreateTransactionRequestStub = Sinon.stub(ChargingModuleCreateTransactionRequest, 'send')
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
      beforeEach(async () => {
        chargingModuleCreateTransactionRequestStub.onFirstCall().resolves({
          ..._chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
        })

        chargingModuleCreateTransactionRequestStub.onSecondCall().resolves({
          ..._chargingModuleResponse('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
        })
      })

      describe('and they are billable', () => {
        beforeEach(async () => {
          // We want to ensure there is coverage of the functionality that finds an existing bill licence or creates a
          // new one when processing a billing account. To to that we need a billing account with 2 charge versions
          // linked to the same licence
          billingAccount.chargeVersions = [
            _chargeVersion(billingAccount.id, licence),
            _chargeVersion(billingAccount.id, licence)
          ]
        })

        it('returns true (bill run is not empty) and persists the generated bills', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.true()

          const bills = await _fetchPersistedBill(billRun.id)

          expect(bills).to.have.length(1)
          expect(bills[0]).to.equal(
            {
              accountNumber: billingAccount.accountNumber,
              address: {}, // Address is set to an empty object for SROC billing invoices
              billingAccountId: billingAccount.id,
              credit: false,
              financialYearEnding: billingPeriod.endDate.getFullYear()
            },
            { skip: ['billLicences'] }
          )

          expect(bills[0].billLicences).to.have.length(1)
          expect(bills[0].billLicences[0]).to.equal(
            {
              licenceId: licence.id,
              licenceRef: licence.licenceRef
            },
            { skip: ['transactions'] }
          )

          expect(bills[0].billLicences[0].transactions).to.have.length(2)
        })
      })

      describe('and they are partially billable (a bill licence generates 0 transactions)', () => {
        beforeEach(() => {
          // Create a licence that has a revoked date before the billing period and then link it to a charge version
          // that is also linked to our billing account. The engine will determine that the charge period for the charge
          // version is invalid so won't attempt to generate a transaction. If we did try, the Charging Module would
          // only reject it.
          const unbillableLicence = _licence()

          unbillableLicence.revokedDate = new Date('2019-01-01')

          const unbillableChargeVersion = _chargeVersion(billingAccount.id, unbillableLicence)

          billingAccount.chargeVersions = [
            _chargeVersion(billingAccount.id, licence),
            _chargeVersion(billingAccount.id, licence),
            unbillableChargeVersion
          ]
        })

        it('returns true (bill run is not empty) and only persists the bill licences with transactions', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.true()

          const bills = await _fetchPersistedBill(billRun.id)

          expect(bills).to.have.length(1)
          expect(bills[0]).to.equal(
            {
              accountNumber: billingAccount.accountNumber,
              address: {}, // Address is set to an empty object for SROC billing invoices
              billingAccountId: billingAccount.id,
              credit: false,
              financialYearEnding: billingPeriod.endDate.getFullYear()
            },
            { skip: ['billLicences'] }
          )

          expect(bills[0].billLicences).to.have.length(1)
          expect(bills[0].billLicences[0]).to.equal(
            {
              licenceId: licence.id,
              licenceRef: licence.licenceRef
            },
            { skip: ['transactions'] }
          )

          expect(bills[0].billLicences[0].transactions).to.have.length(2)
        })
      })

      describe('but they are not billable', () => {
        beforeEach(() => {
          // This time we update the charge version so that nothing is allocated in the charge references. This means
          // the service will not generate any transactions and therefore no bills leading to bills being empty
          const unbillableChargeVersion = _chargeVersion(billingAccount.id, licence)

          unbillableChargeVersion.chargeReferences[0].chargeElements[0].reviewChargeElements[0].amendedAllocated = 0
          unbillableChargeVersion.chargeReferences[0].chargeElements[1].reviewChargeElements[0].amendedAllocated = 0

          billingAccount.chargeVersions = [unbillableChargeVersion]
        })

        it('returns false (bill run is empty) and persists nothing', async () => {
          const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

          expect(result).to.be.false()

          const bills = await _fetchPersistedBill(billRun.id)

          expect(bills).to.be.empty()
        })
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(async () => {
      billingAccount.chargeVersions = [_chargeVersion(billingAccount.id, licence)]
    })

    describe('because generating the calculated transaction fails', () => {
      beforeEach(async () => {
        Sinon.stub(GenerateTwoPartTariffTransactionService, 'go').throws()
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])).to.reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToPrepareTransactions)
      })
    })

    describe('because sending the transactions fails', () => {
      beforeEach(async () => {
        chargingModuleCreateTransactionRequestStub.rejects()
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await expect(ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])).to.reject()

        expect(error).to.be.an.instanceOf(BillRunError)
        expect(error.code).to.equal(BillRunModel.errorCodes.failedToCreateCharge)
      })
    })
  })
})

function _billingAccount() {
  return {
    id: generateUUID(),
    accountNumber: generateAccountNumber()
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

function _chargeVersion(billingAccountId, licence) {
  // NOTE: We are faking an Objection model which comes with a toJSON() method that gets called as part
  // of processing the billing account.
  const toJSON = () => {
    return '{}'
  }

  return {
    id: generateUUID(),
    scheme: 'sroc',
    startDate: new Date('2022-04-01'),
    endDate: null,
    billingAccountId,
    status: 'current',
    licence,
    chargeReferences: [
      {
        id: generateUUID(),
        additionalCharges: { isSupplyPublicWater: false },
        adjustments: {
          s126: null,
          s127: false,
          s130: false,
          charge: null,
          winter: false,
          aggregate: '0.562114443'
        },
        chargeCategory: {
          id: 'b270718a-12c0-4fca-884b-3f8612dbe2f5',
          reference: '4.4.5',
          shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model'
        },
        chargeElements: [
          {
            id: 'e6b98712-227a-40c2-b93a-c05e9047be8c',
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            reviewChargeElements: [{ id: '1d9050b2-09c8-4570-8173-7f55921437cc', amendedAllocated: 5 }],
            toJSON
          },
          {
            id: '9e6f3f64-78d5-441b-80fc-e01711b2f766',
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            reviewChargeElements: [{ id: '17f0c41e-e894-41d2-8a68-69dd2b39e9f9', amendedAllocated: 10 }],
            toJSON
          }
        ],
        description: 'Lower Queenstown - Pittisham',
        loss: 'low',
        reviewChargeReferences: [
          {
            id: '3dd04348-2c06-4559-9343-dd7dd76276ef',
            amendedAggregate: 0.75,
            amendedAuthorisedVolume: 20,
            amendedChargeAdjustment: 0.6
          }
        ],
        source: 'non-tidal',
        volume: 20
      }
    ]
  }
}

async function _fetchPersistedBill(billRunId) {
  return BillModel.query()
    .select(['accountNumber', 'address', 'billingAccountId', 'credit', 'financialYearEnding'])
    .where('billRunId', billRunId)
    .withGraphFetched('billLicences')
    .modifyGraph('billLicences', (builder) => {
      builder.select(['licenceId', 'licenceRef'])
    })
    .withGraphFetched('billLicences.transactions')
    .modifyGraph('billLicences.transactions', (builder) => {
      builder.select(['id'])
    })
}

function _licence() {
  const region = RegionHelper.select()

  return {
    id: generateUUID(),
    licenceRef: generateLicenceRef(),
    waterUndertaker: true,
    historicalAreaCode: 'SAAR',
    regionalChargeArea: 'Southern',
    startDate: new Date('2022-01-01'),
    expiredDate: null,
    lapsedDate: null,
    revokedDate: null,
    region: {
      id: region.id,
      chargeRegionId: region.chargeRegionId
    }
  }
}
