'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillModel = require('../../../../app/models/bill.model.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const TwoPartTariffFixture = require('../../../fixtures/two-part-tariff.fixture.js')

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
  let region

  beforeEach(async () => {
    region = RegionHelper.select()
    billRun = TwoPartTariffFixture.billRun(region.id)
    billingAccount = TwoPartTariffFixture.billingAccount()
    licence = TwoPartTariffFixture.licence(region)

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
          ...TwoPartTariffFixture.chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
        })

        chargingModuleCreateTransactionRequestStub.onSecondCall().resolves({
          ...TwoPartTariffFixture.chargingModuleResponse('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
        })
      })

      describe('and they are billable', () => {
        beforeEach(async () => {
          // We want to ensure there is coverage of the functionality that finds an existing bill licence or creates a
          // new one when processing a billing account. To to that we need a billing account with 2 charge versions
          // linked to the same licence
          billingAccount.chargeVersions = [
            TwoPartTariffFixture.chargeVersion(billingAccount.id, licence),
            TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)
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
          const unbillableLicence = TwoPartTariffFixture.licence(region)

          unbillableLicence.revokedDate = new Date('2019-01-01')

          const unbillableChargeVersion = TwoPartTariffFixture.chargeVersion(billingAccount.id, unbillableLicence)

          billingAccount.chargeVersions = [
            TwoPartTariffFixture.chargeVersion(billingAccount.id, licence),
            TwoPartTariffFixture.chargeVersion(billingAccount.id, licence),
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
          const unbillableChargeVersion = TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)

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
      billingAccount.chargeVersions = [TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)]
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
