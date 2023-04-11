'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')

// Thing under test
const FetchPreviousBillingTransactionsService = require('../../../app/services/supplementary-billing/fetch-previous-billing-transactions.service.js')

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
        const billingInvoiceLicenceId = await _createBillingBatchInvoiceAndLicence(invoiceAccountId, licenceId)
        await BillingTransactionHelper.add({ billingInvoiceLicenceId })
      })

      it('returns results', async () => {
        const result = await FetchPreviousBillingTransactionsService.go(
          { invoiceAccountId },
          { licenceId },
          financialYearEnding
        )

        expect(result).to.have.length(1)
      })

      describe('followed by another run which credits the previous', () => {
        beforeEach(async () => {
          const billingInvoiceLicenceId = await _createBillingBatchInvoiceAndLicence(invoiceAccountId, licenceId)
          await BillingTransactionHelper.add({ billingInvoiceLicenceId, isCredit: true })
        })

        it('returns no results', async () => {
          const result = await FetchPreviousBillingTransactionsService.go(
            { invoiceAccountId },
            { licenceId },
            financialYearEnding
          )

          expect(result).to.be.empty()
        })
      })

      describe('followed by more runs with equal credits and debits', () => {
        beforeEach(async () => {
          const creditsBillingInvoiceLicenceId = await _createBillingBatchInvoiceAndLicence(invoiceAccountId, licenceId)
          await BillingTransactionHelper.add({
            billingInvoiceLicenceId: creditsBillingInvoiceLicenceId,
            isCredit: true
          })
          await BillingTransactionHelper.add({
            billingInvoiceLicenceId: creditsBillingInvoiceLicenceId,
            isCredit: true
          })

          const debitBillingInvoiceLicenceId = await _createBillingBatchInvoiceAndLicence(invoiceAccountId, licenceId)
          await BillingTransactionHelper.add({ billingInvoiceLicenceId: debitBillingInvoiceLicenceId })
        })

        it('returns no results', async () => {
          const result = await FetchPreviousBillingTransactionsService.go(
            { invoiceAccountId },
            { licenceId },
            financialYearEnding
          )

          expect(result).to.be.empty()
        })
      })

      describe('followed by more runs with unequal credits and debits', () => {
        beforeEach(async () => {
          const unmatchedBillingInvoiceLicenceId = await _createBillingBatchInvoiceAndLicence(
            invoiceAccountId,
            licenceId
          )
          await BillingTransactionHelper.add({
            billingInvoiceLicenceId: unmatchedBillingInvoiceLicenceId,
            billableDays: 30,
            isCredit: true
          })

          const matchedBillingInvoiceLicenceId = await _createBillingBatchInvoiceAndLicence(invoiceAccountId, licenceId)
          await BillingTransactionHelper.add({
            billingInvoiceLicenceId: matchedBillingInvoiceLicenceId,
            isCredit: true
          })
          await BillingTransactionHelper.add({ billingInvoiceLicenceId: matchedBillingInvoiceLicenceId })
        })

        it('returns results', async () => {
          const result = await FetchPreviousBillingTransactionsService.go(
            { invoiceAccountId },
            { licenceId },
            financialYearEnding
          )

          expect(result).to.have.length(1)
        })
      })
    })

    describe('but for a different licence', () => {
      beforeEach(async () => {
        const billingInvoiceLicenceId = await _createBillingBatchInvoiceAndLicence(invoiceAccountId, '66498337-e6a6-4a2a-9fb7-e39f43410f80')
        await BillingTransactionHelper.add({ billingInvoiceLicenceId })
      })

      it('returns no results', async () => {
        const result = await FetchPreviousBillingTransactionsService.go(
          { invoiceAccountId },
          { licenceId },
          financialYearEnding
        )

        expect(result).to.be.empty()
      })
    })

    describe('but for a different invoice account', () => {
      beforeEach(async () => {
        const billingInvoiceLicenceId = await _createBillingBatchInvoiceAndLicence(
          'b0b75e7a-e80a-4c28-9ac9-33b3a850722b',
          licenceId
        )
        await BillingTransactionHelper.add({ billingInvoiceLicenceId })
      })

      it('returns no results', async () => {
        const result = await FetchPreviousBillingTransactionsService.go(
          { invoiceAccountId },
          { licenceId },
          financialYearEnding
        )

        expect(result).to.be.empty()
      })
    })
  })
})

async function _createBillingBatchInvoiceAndLicence (invoiceAccountId, licenceId) {
  const { billingBatchId } = await BillingBatchHelper.add({ status: 'sent' })
  const { billingInvoiceId } = await BillingInvoiceHelper.add({ invoiceAccountId }, { billingBatchId })
  const { billingInvoiceLicenceId } = await BillingInvoiceLicenceHelper.add(
    {},
    { licenceId },
    { billingInvoiceId }
  )

  return billingInvoiceLicenceId
}
