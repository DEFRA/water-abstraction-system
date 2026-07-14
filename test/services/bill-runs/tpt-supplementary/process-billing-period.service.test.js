// Test helpers
import * as RegionHelper from '../../../support/helpers/region.helper.js'
import * as TwoPartTariffFixture from '../../../support/fixtures/two-part-tariff.fixture.js'

// Things we need to stub
import BillModel from '../../../../app/models/bill.model.js'
import BillLicenceModel from '../../../../app/models/bill-licence.model.js'
import BillRunError from '../../../../app/errors/bill-run.error.js'
import BillRunModel from '../../../../app/models/bill-run.model.js'
import * as FetchPreviousTransactionsService from '../../../../app/services/bill-runs/fetch-previous-transactions.service.js'
import * as GenerateTwoPartTariffTransactionService from '../../../../app/services/bill-runs/generate-two-part-tariff-transaction.service.js'
import * as ProcessSupplementaryTransactionsService from '../../../../app/services/bill-runs/process-supplementary-transactions.service.js'
import * as SendTransactionsService from '../../../../app/services/bill-runs/send-transactions.service.js'
import TransactionModel from '../../../../app/models/transaction.model.js'

// Thing under test
import ProcessBillingPeriodService from '../../../../app/services/bill-runs/tpt-supplementary/process-billing-period.service.js'

describe('Bill Runs - TPT Supplementary - Process Billing Period service', () => {
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
    billRun = TwoPartTariffFixture.billRun()
    billingAccount = TwoPartTariffFixture.billingAccount()
    licence = TwoPartTariffFixture.licence(region)

    billInsertStub = vi.fn()
    billLicenceInsertStub = vi.fn()
    transactionInsertStub = vi.fn()

    vi.spyOn(BillModel, 'query').mockReturnValue({ insert: billInsertStub })
    vi.spyOn(BillLicenceModel, 'query').mockReturnValue({ insert: billLicenceInsertStub })
    vi.spyOn(TransactionModel, 'query').mockReturnValue({ insert: transactionInsertStub })

    vi.spyOn(FetchPreviousTransactionsService, 'default').mockResolvedValue([])
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
      describe('and they have two-part tariff charge versions processed during match & allocate', () => {
        describe('and no previous billed transactions', () => {
          describe('and the billable volume is greater than 0', () => {
            beforeEach(async () => {
              // We want to ensure there is coverage of the functionality that finds an existing bill licence or creates a
              // new one when processing a billing account. To to that we need a billing account with 2 charge versions
              // linked to the same licence
              billingAccount.chargeVersions = [
                TwoPartTariffFixture.chargeVersion(billingAccount.id, licence),
                TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)
              ]

              // NOTE: We use callsFake() instead of resolves, as it allows us to access the arguments passed to the
              // stub, which we can then use in our response. In this case billLicenceId is generated inside the service
              // but we want to assert that the transactions we're persisting link to the bill licence we are
              // persisting. This allows us to replay back what has been generated with a 'faked' external ID from the
              // Charging Module API
              vi.spyOn(SendTransactionsService, 'default').mockImplementation(
                // NOTE: We could have just referenced processedTransactions as that is a JavaScript quirk. But we
                // wanted to highlight how you would access the other arguments
                async (processedTransactions, _billRunExternalId, _accountNumber, _licence) => {
                  return [
                    { ...processedTransactions[0], externalId: '7e752fa6-a19c-4779-b28c-6e536f028795' },
                    { ...processedTransactions[1], externalId: 'a2086da4-e3b6-4b83-afe1-0e2e5255efaf' }
                  ]
                }
              )
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
              const result = await ProcessBillingPeriodService(billRun, billingPeriod, [billingAccount])

              expect(result).toBe(false)

              expect(billInsertStub).not.toHaveBeenCalled()
            })
          })

          describe('but the charge period is invalid (perhaps the licence has been ended)', () => {
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

        describe('with previous billed transactions', () => {
          describe('that cancel out those generated in the bill run', () => {
            beforeEach(() => {
              // NOTE: If FetchPreviousTransactions finds existing transactions that 'cancel' out those generated as part
              // of the current bill run, ProcessSupplementaryTransactionsService will return nothing, and the engine uses
              // this to know not to create a bill.
              vi.spyOn(ProcessSupplementaryTransactionsService, 'default').mockResolvedValue([])

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

      describe('and they have charge versions not processed during match & allocate because they are not two-part tariff', () => {
        beforeEach(() => {
          // We replicate what FetchBillingAccountsService would return in this scenario, by dropping the charge
          // references from the charge version
          const nonTptChargeVersion = TwoPartTariffFixture.chargeVersion(billingAccount.id, licence)

          nonTptChargeVersion.chargeReferences = []

          billingAccount.chargeVersions = [nonTptChargeVersion]
        })

        describe('and no previous billed transactions', () => {
          it('returns false (bill run is empty) and persists nothing', async () => {
            const result = await ProcessBillingPeriodService(billRun, billingPeriod, [billingAccount])

            expect(result).toBe(false)

            expect(billInsertStub).not.toHaveBeenCalled()
          })
        })

        describe('with previous billed transactions', () => {
          beforeEach(async () => {
            // NOTE: If FetchPreviousTransactions finds existing transactions it'll pass them to
            // ProcessSupplementaryTransactionsService which will then reverse them as credits to
            // ProcessBillingPeriodService.
            vi.spyOn(ProcessSupplementaryTransactionsService, 'default').mockImplementation(
              async (_previousTransactions, _generatedTransactions, billLicenceId) => {
                return [{ billLicenceId, credit: true, id: '3032d87b-176a-4db8-8b6d-f3c04311ca80' }]
              }
            )

            vi.spyOn(SendTransactionsService, 'default').mockImplementation(
              async (processedTransactions, _billRunExternalId, _accountNumber, _licence) => {
                return [{ ...processedTransactions[0], externalId: '7e752fa6-a19c-4779-b28c-6e536f028795' }]
              }
            )
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
            expect(transactionInsertArgs[0]).toHaveLength(1)

            expect(transactionInsertArgs[0][0].billLicenceId).toEqual(billLicenceInsertArgs[0][0].id)
            expect(transactionInsertArgs[0][0].externalId).toEqual('7e752fa6-a19c-4779-b28c-6e536f028795')
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
