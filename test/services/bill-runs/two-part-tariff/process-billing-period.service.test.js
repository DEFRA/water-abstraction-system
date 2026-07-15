// Test helpers
import * as RegionHelper from '../../../support/helpers/region.helper.js'
import * as TwoPartTariffFixture from '../../../support/fixtures/two-part-tariff.fixture.js'

// Things we need to stub
import * as GenerateTwoPartTariffTransactionService from '../../../../app/services/bill-runs/generate-two-part-tariff-transaction.service.js'
import * as SendTransactionsService from '../../../../app/services/bill-runs/send-transactions.service.js'
import BillLicenceModel from '../../../../app/models/bill-licence.model.js'
import BillModel from '../../../../app/models/bill.model.js'
import BillRunError from '../../../../app/errors/bill-run.error.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'
import TransactionModel from '../../../../app/models/transaction.model.js'

// Thing under test
import ProcessBillingPeriodService from '../../../../app/services/bill-runs/two-part-tariff/process-billing-period.service.js'

describe('Bill Runs - Two-part Tariff - Process Billing Period service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let billInsertStub
  let billLicenceInsertStub
  let billRun
  let billingAccount
  let licence
  let region
  let transactionInsertStub

  beforeEach(async () => {
    region = RegionHelper.select()
    billRun = TwoPartTariffFixture.billRun(region.id)
    billingAccount = TwoPartTariffFixture.billingAccount()
    licence = TwoPartTariffFixture.licence(region)

    billInsertStub = vi.fn()
    billLicenceInsertStub = vi.fn()
    transactionInsertStub = vi.fn()

    vi.spyOn(BillModel, 'query').mockReturnValue({ insert: billInsertStub })
    vi.spyOn(BillLicenceModel, 'query').mockReturnValue({ insert: billLicenceInsertStub })
    vi.spyOn(TransactionModel, 'query').mockReturnValue({ insert: transactionInsertStub })
    vi.spyOn(SendTransactionsService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the service is called', () => {
    describe('and there are no billing accounts to process', () => {
      it('returns false (bill run is empty)', async () => {
        const result = await ProcessBillingPeriodService(billRun, billingPeriod, [])

        expect(result).toBe(false)
      })
    })

    describe('and there are billing accounts to process', () => {
      beforeEach(async () => {
        // NOTE: We use callsFake() instead of resolves, as it allows us to access the arguments passed to the stub,
        // which we can then use in our response. In this case billLicenceId is generated inside the service but we want
        // to assert that the transactions we're persisting link to the bill licence we are persisting. This allows us
        // to replay back what has been generated with a 'faked' external ID from the Charging Module API
        SendTransactionsService.default.mockImplementationOnce(
          // NOTE: We could have just referenced processedTransactions as that is a JavaScript quirk. But we
          // wanted to highlight how you would access the other arguments
          async (generatedTransactions, _billRunExternalId, _accountNumber, _licence) => {
            return [{ ...generatedTransactions[0], externalId: '7e752fa6-a19c-4779-b28c-6e536f028795' }]
          }
        )

        SendTransactionsService.default.mockImplementationOnce(
          // NOTE: We could have just referenced processedTransactions as that is a JavaScript quirk. But we
          // wanted to highlight how you would access the other arguments
          async (generatedTransactions, _billRunExternalId, _accountNumber, _licence) => {
            return [{ ...generatedTransactions[0], externalId: 'a2086da4-e3b6-4b83-afe1-0e2e5255efaf' }]
          }
        )
      })

      describe('and they are billable', () => {
        beforeEach(async () => {
          // We want to ensure there is coverage of the functionality that finds an existing bill licence or creates a
          // new one when processing a billing account. To do that we need a billing account with 2 charge versions
          // linked to the same licence
          billingAccount.chargeVersions = [
            TwoPartTariffFixture.chargeVersion(billingAccount.id, licence),
            TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)
          ]
        })

        it('returns true (bill run is not empty) and persists the generated bills', async () => {
          const result = await ProcessBillingPeriodService(billRun, billingPeriod, [billingAccount])

          expect(result).toBe(true)

          // NOTE: We pass a single bill per billing account when persisting
          const billInsertArgs = billInsertStub.mock.calls[0]

          expect(billInsertStub).toHaveBeenCalledOnce()
          expect(billInsertArgs[0]).toMatchObject({
            accountNumber: billingAccount.accountNumber,
            address: {}, // Address is set to an empty object for SROC billing invoices
            billingAccountId: billingAccount.id,
            billRunId: billRun.id,
            credit: false,
            financialYearEnding: billingPeriod.endDate.getFullYear()
          })

          // NOTE: A bill may have multiple bill licences, so we always pass them as an array
          const billLicenceInsertArgs = billLicenceInsertStub.mock.calls[0]

          expect(billLicenceInsertStub).toHaveBeenCalledOnce()
          expect(billLicenceInsertArgs[0]).toHaveLength(1)
          expect(billLicenceInsertArgs[0][0]).toMatchObject({
            billId: billInsertArgs[0].id,
            licenceId: licence.id,
            licenceRef: licence.licenceRef
          })

          // NOTE: And for performance reasons, we pass _all_ transactions for all bill licences at once
          const transactionInsertArgs = transactionInsertStub.mock.calls[0]

          expect(transactionInsertStub).toHaveBeenCalledOnce()
          expect(transactionInsertArgs[0]).toHaveLength(2)

          // We just check that on of the transactions being persisted is linked to the records we expect
          expect(transactionInsertArgs[0][0].billLicenceId).toEqual(billLicenceInsertArgs[0][0].id)
          expect(transactionInsertArgs[0][0].externalId).toEqual('7e752fa6-a19c-4779-b28c-6e536f028795')
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
          const result = await ProcessBillingPeriodService(billRun, billingPeriod, [billingAccount])

          expect(result).toBe(true)

          // NOTE: We pass a single bill per billing account when persisting
          const billInsertArgs = billInsertStub.mock.calls[0]

          expect(billInsertStub).toHaveBeenCalledOnce()
          expect(billInsertArgs[0]).toMatchObject({
            accountNumber: billingAccount.accountNumber,
            address: {}, // Address is set to an empty object for SROC billing invoices
            billingAccountId: billingAccount.id,
            billRunId: billRun.id,
            credit: false,
            financialYearEnding: billingPeriod.endDate.getFullYear()
          })

          // NOTE: A bill may have multiple bill licences, so we always pass them as an array
          const billLicenceInsertArgs = billLicenceInsertStub.mock.calls[0]

          expect(billLicenceInsertStub).toHaveBeenCalledOnce()
          expect(billLicenceInsertArgs[0]).toHaveLength(1)
          expect(billLicenceInsertArgs[0][0]).toMatchObject({
            billId: billInsertArgs[0].id,
            licenceId: licence.id,
            licenceRef: licence.licenceRef
          })

          // NOTE: And for performance reasons, we pass _all_ transactions for all bill licences at once
          const transactionInsertArgs = transactionInsertStub.mock.calls[0]

          expect(transactionInsertStub).toHaveBeenCalledOnce()
          expect(transactionInsertArgs[0]).toHaveLength(2)

          // We just check that on of the transactions being persisted is linked to the records we expect
          expect(transactionInsertArgs[0][0].billLicenceId).toEqual(billLicenceInsertArgs[0][0].id)
          expect(transactionInsertArgs[0][0].externalId).toEqual('7e752fa6-a19c-4779-b28c-6e536f028795')
        })
      })

      describe('but they are not billable', () => {
        describe('because the billable volume is 0', () => {
          beforeEach(() => {
            // This time we update the charge version so that nothing is allocated in the charge references. This means
            // the service will not generate any transactions and therefore no bills leading to bills being empty
            const unbillableChargeVersion = TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)

            unbillableChargeVersion.chargeReferences[0].chargeElements[0].reviewChargeElements[0].amendedAllocated = 0
            unbillableChargeVersion.chargeReferences[0].chargeElements[1].reviewChargeElements[0].amendedAllocated = 0

            billingAccount.chargeVersions = [unbillableChargeVersion]
          })

          it('returns false (bill run is empty) and persists nothing', async () => {
            const result = await ProcessBillingPeriodService(billRun, billingPeriod, [billingAccount])

            expect(result).toBe(false)

            expect(billInsertStub).not.toHaveBeenCalled()
          })
        })

        describe('because the charge period is invalid (perhaps the licence has been ended)', () => {
          beforeEach(() => {
            licence.revokedDate = new Date('2022-03-31')

            billingAccount.chargeVersions = [TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)]
          })

          it('returns false (bill run is empty) and persists nothing', async () => {
            const result = await ProcessBillingPeriodService(billRun, billingPeriod, [billingAccount])

            expect(result).toBe(false)

            expect(billInsertStub).not.toHaveBeenCalled()
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
        vi.spyOn(GenerateTwoPartTariffTransactionService, 'default').mockImplementation(() => {
          throw new Error()
        })
      })

      it('throws a BillRunError with the correct code', async () => {
        const error = await ProcessBillingPeriodService(billRun, billingPeriod, [billingAccount]).catch((e) => {
          return e
        })

        expect(error).toBeInstanceOf(BillRunError)
        expect(error.code).toEqual(BillRunModel.errorCodes.failedToPrepareTransactions)
      })
    })

    describe('because sending the transactions fails', () => {
      beforeEach(async () => {
        vi.spyOn(SendTransactionsService, 'default').mockRejectedValue(new Error())
      })

      it('throws an error', async () => {
        const error = await ProcessBillingPeriodService(billRun, billingPeriod, [billingAccount]).catch((e) => {
          return e
        })

        expect(error).toBeInstanceOf(Error)
      })
    })
  })
})
