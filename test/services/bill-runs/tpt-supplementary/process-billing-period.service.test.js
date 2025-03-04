'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const TwoPartTariffFixture = require('../../../fixtures/two-part-tariff.fixture.js')

// Things we need to stub
const BillModel = require('../../../../app/models/bill.model.js')
const BillLicenceModel = require('../../../../app/models/bill-licence.model.js')
const BillRunError = require('../../../../app/errors/bill-run.error.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ChargingModuleCreateTransactionRequest = require('../../../../app/requests/charging-module/create-transaction.request.js')
const GenerateTwoPartTariffTransactionService = require('../../../../app/services/bill-runs/generate-two-part-tariff-transaction.service.js')
const FetchPreviousTransactionsService = require('../../../../app/services/bill-runs/fetch-previous-transactions.service.js')
const ProcessSupplementaryTransactionsService = require('../../../../app/services/bill-runs/process-supplementary-transactions.service.js')
const TransactionModel = require('../../../../app/models/transaction.model.js')

// Thing under test
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/tpt-supplementary/process-billing-period.service.js')

describe('Bill Runs - TPT Supplementary - Process Billing Period service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let billInsertStub
  let billLicenceInsertStub
  let billRun
  let billingAccount
  let chargingModuleCreateTransactionRequestStub
  let fetchPreviousTransactionsStub
  let licence
  let region
  let transactionInsertStub

  beforeEach(async () => {
    region = RegionHelper.select()
    billRun = TwoPartTariffFixture.billRun()
    billingAccount = TwoPartTariffFixture.billingAccount()
    licence = TwoPartTariffFixture.licence(region)

    fetchPreviousTransactionsStub = Sinon.stub(FetchPreviousTransactionsService, 'go')
    chargingModuleCreateTransactionRequestStub = Sinon.stub(ChargingModuleCreateTransactionRequest, 'send')

    billInsertStub = Sinon.stub()
    billLicenceInsertStub = Sinon.stub()
    transactionInsertStub = Sinon.stub()

    Sinon.stub(BillModel, 'query').returns({ insert: billInsertStub })
    Sinon.stub(BillLicenceModel, 'query').returns({ insert: billLicenceInsertStub })
    Sinon.stub(TransactionModel, 'query').returns({ insert: transactionInsertStub })
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
      describe('and no previous billed transactions', () => {
        beforeEach(() => {
          // NOTE: Called by ProcessSupplementaryTransactions when checking if any previous billed transactions need to
          // be considered/processed. Stubbing FetchPreviousTransactionsService means ProcessSupplementaryTransactions
          // will just return what we passed in.
          fetchPreviousTransactionsStub.resolves([])
        })

        describe('and the billable volume is greater than 0', () => {
          beforeEach(async () => {
            // We want to ensure there is coverage of the functionality that finds an existing bill licence or creates a
            // new one when processing a billing account. To to that we need a billing account with 2 charge versions
            // linked to the same licence
            billingAccount.chargeVersions = [
              TwoPartTariffFixture.chargeVersion(billingAccount.id, licence),
              TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)
            ]

            chargingModuleCreateTransactionRequestStub.onFirstCall().resolves({
              ...TwoPartTariffFixture.chargingModuleResponse('7e752fa6-a19c-4779-b28c-6e536f028795')
            })

            chargingModuleCreateTransactionRequestStub.onSecondCall().resolves({
              ...TwoPartTariffFixture.chargingModuleResponse('a2086da4-e3b6-4b83-afe1-0e2e5255efaf')
            })
          })

          it('returns true (bill run is not empty) and persists the generated bills', async () => {
            const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

            expect(result).to.be.true()

            // NOTE: We pass a single bill per billing account when persisting
            const billInsertArgs = billInsertStub.args[0]

            expect(billInsertStub.calledOnce).to.be.true()
            expect(billInsertArgs[0]).to.equal(
              {
                accountNumber: billingAccount.accountNumber,
                address: {}, // Address is set to an empty object for SROC billing invoices
                billingAccountId: billingAccount.id,
                billRunId: billRun.id,
                credit: false,
                financialYearEnding: billingPeriod.endDate.getFullYear()
              },
              { skip: ['id'] }
            )

            // NOTE: A bill may have multiple bill licences, so we always pass them as an array
            const billLicenceInsertArgs = billLicenceInsertStub.args[0]

            expect(billLicenceInsertStub.calledOnce).to.be.true()
            expect(billLicenceInsertArgs[0]).to.have.length(1)
            expect(billLicenceInsertArgs[0][0]).to.equal(
              {
                billId: billInsertArgs[0].id,
                licenceId: licence.id,
                licenceRef: licence.licenceRef
              },
              { skip: ['id'] }
            )

            // NOTE: And for performance reasons, we pass _all_ transactions for all bill licences at once
            const transactionInsertArgs = transactionInsertStub.args[0]

            expect(transactionInsertStub.calledOnce).to.be.true()
            expect(transactionInsertArgs[0]).to.have.length(2)

            // We just check that on of the transactions being persisted is linked to the records we expect
            expect(transactionInsertArgs[0][0].billLicenceId).equal(billLicenceInsertArgs[0][0].id)
            expect(transactionInsertArgs[0][0].externalId).equal('7e752fa6-a19c-4779-b28c-6e536f028795')
          })
        })

        describe('but the billable volume is 0', () => {
          beforeEach(() => {
            // This time we update the charge version so that nothing is allocated in the charge references. This means
            // the service will not generate any transactions so no bill licences, leading to bills being empty
            const unbillableChargeVersion = TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)

            unbillableChargeVersion.chargeReferences[0].chargeElements[0].reviewChargeElements[0].amendedAllocated = 0
            unbillableChargeVersion.chargeReferences[0].chargeElements[1].reviewChargeElements[0].amendedAllocated = 0

            billingAccount.chargeVersions = [unbillableChargeVersion]
          })

          it('returns false (bill run is empty) and persists nothing', async () => {
            const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

            expect(result).to.be.false()

            expect(billInsertStub.called).to.be.false()
          })
        })

        describe('but the charge period is invalid (perhaps the licence has been ended)', () => {
          beforeEach(() => {
            licence.revokedDate = new Date('2022-03-31')

            billingAccount.chargeVersions = [TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)]
          })

          it('returns false (bill run is empty) and persists nothing', async () => {
            const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

            expect(result).to.be.false()

            expect(billInsertStub.called).to.be.false()
          })
        })
      })

      describe('with previous billed transactions', () => {
        describe('that cancel out those generated in the bill run', () => {
          beforeEach(() => {
            // NOTE: If FetchPreviousTransactions finds existing transactions that 'cancel' out those generated as part
            // of the current bill run, ProcessSupplementaryTransactionsService will return nothing, and the engine uses
            // this to know not to create a bill.
            Sinon.stub(ProcessSupplementaryTransactionsService, 'go').resolves([])

            billingAccount.chargeVersions = [TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)]
          })

          it('returns false (bill run is empty) and persists nothing', async () => {
            const result = await ProcessBillingPeriodService.go(billRun, billingPeriod, [billingAccount])

            expect(result).to.be.false()

            expect(billInsertStub.called).to.be.false()
          })
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
        // NOTE: Called by ProcessSupplementaryTransactions when checking if any previous billed transactions need to
        // be considered/processed. Stubbing FetchPreviousTransactionsService means ProcessSupplementaryTransactions
        // will just return what we passed in, which is all we need make the engine attempt to get the charge from the
        // Charging Module API.
        fetchPreviousTransactionsStub.resolves([])
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
