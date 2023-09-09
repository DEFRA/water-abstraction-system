'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const BillRunHelper = require('../../../support/helpers/water/bill-run.helper.js')
const BillingInvoiceHelper = require('../../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingTransactionHelper = require('../../../support/helpers/water/billing-transaction.helper.js')

// Thing under test
const FetchPreviousBillingTransactionsService = require('../../../../app/services/billing/supplementary/fetch-previous-billing-transactions.service.js')

describe('Fetch Previous Billing Transactions service', () => {
  const invoiceAccountId = '4fe996c9-7641-4edc-9f42-0700dcde37b5'
  const licenceId = '4492f1e2-f58c-4d4f-88a1-d4f9eb26fcba'
  const financialYearEnding = 2023

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are no billing transactions', () => {
    it('returns no results', async () => {
      const result = await FetchPreviousBillingTransactionsService.go(
        { invoiceAccountId },
        { licenceId },
        financialYearEnding
      )

      expect(result).to.be.empty()
    })
  })

  describe('when there is a bill run', () => {
    describe('for the same licence and invoice account', () => {
      beforeEach(async () => {
        const billingInvoiceLicenceId = await _createBillRunInvoiceAndLicence(invoiceAccountId, licenceId)
        await BillingTransactionHelper.add({ billingInvoiceLicenceId })
      })

      it('returns results', async () => {
        const results = await FetchPreviousBillingTransactionsService.go(
          { invoiceAccountId },
          { licenceId },
          financialYearEnding
        )

        expect(results).to.have.length(1)
        expect(results[0].isCredit).to.be.false()
      })

      describe('followed by another bill run for the same licence and invoice account', () => {
        let followUpBillingInvoiceLicenceId

        beforeEach(async () => {
          followUpBillingInvoiceLicenceId = await _createBillRunInvoiceAndLicence(invoiceAccountId, licenceId)
        })

        describe('which only contains a credit', () => {
          describe("that matches the first bill run's debit", () => {
            beforeEach(async () => {
              await BillingTransactionHelper.add({
                billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                isCredit: true
              })
            })

            it('returns no results', async () => {
              const results = await FetchPreviousBillingTransactionsService.go(
                { invoiceAccountId },
                { licenceId },
                financialYearEnding
              )

              expect(results).to.be.empty()
            })
          })

          describe("that does not match the first bill run's debit", () => {
            describe('because the billable days are different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  billableDays: 30,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the charge type is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  chargeType: 'compensation',
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the charge category code is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  chargeCategoryCode: '4.3.2',
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the abatement agreement (section 126) is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  section126Factor: 0.5,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the two-part tariff agreement (section 127) is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  section127Agreement: true,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the canal and river trust agreement (section 130) is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  section130Agreement: true,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the aggregate is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  aggregateFactor: 0.5,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the charge adjustment is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  adjustmentFactor: 0.5,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the winter discount is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  isWinterOnly: true,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the supported source differs (additional charge) is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  isSupportedSource: true,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the supported source name differs (additional charge) is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  supportedSourceName: 'source name',
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })

            describe('because the water company flag differs (additional charge) is different', () => {
              beforeEach(async () => {
                await BillingTransactionHelper.add({
                  billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                  isWaterCompanyCharge: true,
                  isCredit: true
                })
              })

              it('returns the debits', async () => {
                const results = await FetchPreviousBillingTransactionsService.go(
                  { invoiceAccountId },
                  { licenceId },
                  financialYearEnding
                )

                expect(results).to.have.length(1)
                expect(results[0].isCredit).to.be.false()
              })
            })
          })
        })

        describe('which contains a debit', () => {
          beforeEach(async () => {
            await BillingTransactionHelper.add({
              billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
              description: 'follow up'
            })
          })

          describe("and a credit that matches the first bill run's debit", () => {
            beforeEach(async () => {
              await BillingTransactionHelper.add({
                billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                isCredit: true
              })
            })

            it('returns only the follow up debit', async () => {
              const results = await FetchPreviousBillingTransactionsService.go(
                { invoiceAccountId },
                { licenceId },
                financialYearEnding
              )

              expect(results).to.have.length(1)
              expect(results[0].isCredit).to.be.false()
              expect(results[0].description).to.equal('follow up')
            })
          })

          describe("and a credit that does not match the first bill run's debit", () => {
            beforeEach(async () => {
              await BillingTransactionHelper.add({
                billingInvoiceLicenceId: followUpBillingInvoiceLicenceId,
                billableDays: 30,
                isCredit: true
              })
            })

            it('returns both debits', async () => {
              const results = await FetchPreviousBillingTransactionsService.go(
                { invoiceAccountId },
                { licenceId },
                financialYearEnding
              )

              expect(results).to.have.length(2)
              expect(results.every((transaction) => !transaction.isCredit)).to.be.true()
              expect(results.find((transaction) => transaction.description === 'follow up')).to.exist()
            })
          })
        })
      })
    })

    describe('but for a different licence', () => {
      beforeEach(async () => {
        const billingInvoiceLicenceId = await _createBillRunInvoiceAndLicence(invoiceAccountId, '66498337-e6a6-4a2a-9fb7-e39f43410f80')
        await BillingTransactionHelper.add({ billingInvoiceLicenceId })
      })

      it('returns no results', async () => {
        const results = await FetchPreviousBillingTransactionsService.go(
          { invoiceAccountId },
          { licenceId },
          financialYearEnding
        )

        expect(results).to.be.empty()
      })
    })

    describe('but for a different invoice account', () => {
      beforeEach(async () => {
        const billingInvoiceLicenceId = await _createBillRunInvoiceAndLicence(
          'b0b75e7a-e80a-4c28-9ac9-33b3a850722b',
          licenceId
        )
        await BillingTransactionHelper.add({ billingInvoiceLicenceId })
      })

      it('returns no results', async () => {
        const results = await FetchPreviousBillingTransactionsService.go(
          { invoiceAccountId },
          { licenceId },
          financialYearEnding
        )

        expect(results).to.be.empty()
      })
    })
  })
})

async function _createBillRunInvoiceAndLicence (invoiceAccountId, licenceId) {
  const { billingBatchId } = await BillRunHelper.add({ status: 'sent' })
  const { billingInvoiceId } = await BillingInvoiceHelper.add({ invoiceAccountId, billingBatchId })
  const { billingInvoiceLicenceId } = await BillingInvoiceLicenceHelper.add({ billingInvoiceId, licenceId })

  return billingInvoiceLicenceId
}
