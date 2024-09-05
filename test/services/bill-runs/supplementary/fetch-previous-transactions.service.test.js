'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const TransactionHelper = require('../../../support/helpers/transaction.helper.js')

// Thing under test
const FetchPreviousTransactionsService = require('../../../../app/services/bill-runs/supplementary/fetch-previous-transactions.service.js')

describe('Fetch Previous Transactions service', () => {
  const chargeCategoryCode = '4.3.1'
  const financialYearEnding = 2023
  const billingAccountId = '4fe996c9-7641-4edc-9f42-0700dcde37b5'
  const accountNumber = BillingAccountHelper.generateAccountNumber()
  const licenceId = '4492f1e2-f58c-4d4f-88a1-d4f9eb26fcba'
  const licenceRef = LicenceHelper.generateLicenceRef()

  const billRunSetupValues = { billingAccountId, accountNumber, licenceId, licenceRef }

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there are no transactions', () => {
    it('returns no results', async () => {
      const result = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

      expect(result).to.be.empty()
    })
  })

  describe('when there is a bill run', () => {
    describe('for the same licence and billing account', () => {
      beforeEach(async () => {
        const billLicenceId = await _createBillRunAndBillAndBillLicence(billRunSetupValues)

        await TransactionHelper.add({ billLicenceId, chargeCategoryCode })
      })

      it('returns results', async () => {
        const results = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

        expect(results).to.have.length(1)
        expect(results[0].credit).to.be.false()
      })

      describe('followed by another bill run for the same licence and billing account', () => {
        let followUpBillLicenceId

        beforeEach(async () => {
          followUpBillLicenceId = await _createBillRunAndBillAndBillLicence(billRunSetupValues)
        })

        describe('which only contains a credit', () => {
          describe("that matches the first bill run's debit", () => {
            beforeEach(async () => {
              await TransactionHelper.add({
                billLicenceId: followUpBillLicenceId,
                chargeCategoryCode,
                credit: true
              })
            })

            it('returns no results', async () => {
              const results = await FetchPreviousTransactionsService.go(
                billingAccountId,
                licenceId,
                financialYearEnding
              )

              expect(results).to.be.empty()
            })
          })

          describe("that does not match the first bill run's debit", () => {
            beforeEach(async () => {
              await TransactionHelper.add({
                billLicenceId: followUpBillLicenceId,
                billableDays: 30,
                chargeCategoryCode,
                credit: true
              })
            })

            it('returns the debits', async () => {
              const results = await FetchPreviousTransactionsService.go(
                billingAccountId,
                licenceId,
                financialYearEnding
              )

              expect(results).to.have.length(1)
              expect(results[0].credit).to.be.false()
            })
          })
        })

        describe('which contains a debit', () => {
          beforeEach(async () => {
            await TransactionHelper.add({
              billLicenceId: followUpBillLicenceId,
              description: 'follow up'
            })
          })

          describe("and a credit that matches the first bill run's debit", () => {
            beforeEach(async () => {
              await TransactionHelper.add({
                billLicenceId: followUpBillLicenceId,
                chargeCategoryCode,
                credit: true
              })
            })

            it('returns only the follow up debit', async () => {
              const results = await FetchPreviousTransactionsService.go(
                billingAccountId,
                licenceId,
                financialYearEnding
              )

              expect(results).to.have.length(1)
              expect(results[0].credit).to.be.false()
              expect(results[0].description).to.equal('follow up')
            })
          })

          describe("and a credit that does not match the first bill run's debit", () => {
            beforeEach(async () => {
              await TransactionHelper.add({
                billLicenceId: followUpBillLicenceId,
                billableDays: 30,
                chargeCategoryCode,
                credit: true
              })
            })

            it('returns both debits', async () => {
              const results = await FetchPreviousTransactionsService.go(
                billingAccountId,
                licenceId,
                financialYearEnding
              )

              expect(results).to.have.length(2)
              expect(results.every((transaction) => {
                return !transaction.credit
              })).to.be.true()
              expect(results.find((transaction) => {
                return transaction.description === 'follow up'
              })).to.exist()
            })
          })
        })
      })
    })

    describe('but for a different licence', () => {
      beforeEach(async () => {
        const billLicenceId = await _createBillRunAndBillAndBillLicence({
          ...billRunSetupValues,
          licenceId: '66498337-e6a6-4a2a-9fb7-e39f43410f80'
        })

        await TransactionHelper.add({ billLicenceId, chargeCategoryCode })
      })

      it('returns no results', async () => {
        const results = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

        expect(results).to.be.empty()
      })
    })

    describe('but for a different billing account', () => {
      beforeEach(async () => {
        const billLicenceId = await _createBillRunAndBillAndBillLicence({
          ...billRunSetupValues,
          billingAccountId: 'b0b75e7a-e80a-4c28-9ac9-33b3a850722b'
        })

        await TransactionHelper.add({ billLicenceId, chargeCategoryCode })
      })

      it('returns no results', async () => {
        const results = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

        expect(results).to.be.empty()
      })
    })
  })
})

async function _createBillRunAndBillAndBillLicence (billRunSetupValues) {
  const { billingAccountId, accountNumber, licenceId, licenceRef } = billRunSetupValues
  const { id: billRunId } = await BillRunHelper.add({ status: 'sent' })
  const { id: billId } = await BillHelper.add({ billRunId, billingAccountId, accountNumber })
  const { id: billLicenceId } = await BillLicenceHelper.add({ billId, licenceId, licenceRef })

  return billLicenceId
}
