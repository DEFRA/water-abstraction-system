'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')

// Thing under test
const GenerateBillingInvoiceService = require('../../../app/services/supplementary-billing/generate-billing-invoice.service.js')

describe('Generate billing invoice service', () => {
  const billingBatchId = 'f4fb6257-c50f-46ea-80b0-7533423d6efd'
  const financialYearEnding = 2023

  let currentBillingInvoice
  let expectedResult
  let invoiceAccount

  beforeEach(async () => {
    await DatabaseHelper.clean()

    invoiceAccount = await InvoiceAccountHelper.add()
  })

  describe('when `currentBillingInvoice` is null', () => {
    beforeEach(async () => {
      currentBillingInvoice = null
      expectedResult = _billingInvoiceGenerator(invoiceAccount, billingBatchId, financialYearEnding)
    })

    it('returns a new billing invoice with the provided values', async () => {
      const result = await GenerateBillingInvoiceService.go(
        currentBillingInvoice,
        invoiceAccount.invoiceAccountId,
        billingBatchId,
        financialYearEnding
      )

      expect(result).to.equal(expectedResult, { skip: 'billingInvoiceId' })
    })
  })

  describe('when `currentBillingInvoice` is set', () => {
    beforeEach(async () => {
      currentBillingInvoice = _billingInvoiceGenerator(invoiceAccount, billingBatchId, financialYearEnding)
    })

    describe('and the invoice account ID matches', () => {
      it('returns the `currentBillingInvoice`', async () => {
        const result = await GenerateBillingInvoiceService.go(
          currentBillingInvoice,
          currentBillingInvoice.invoiceAccountId,
          billingBatchId,
          financialYearEnding
        )

        expect(result).to.equal(currentBillingInvoice)
      })
    })

    describe('and the invoice account ID does not match', () => {
      let otherInvoiceAccount

      beforeEach(async () => {
        otherInvoiceAccount = await InvoiceAccountHelper.add()
      })

      it('returns a new billing invoice with the provided values', async () => {
        const result = await GenerateBillingInvoiceService.go(
          currentBillingInvoice,
          otherInvoiceAccount.invoiceAccountId,
          billingBatchId,
          financialYearEnding
        )

        expect(result).not.to.equal(currentBillingInvoice)
        expect(result.invoiceAccountId).to.equal(otherInvoiceAccount.invoiceAccountId)
      })
    })
  })
})

function _billingInvoiceGenerator (invoiceAccount, billingBatchId, financialYearEnding) {
  return {
    billingInvoiceId: 'fa0c763e-3976-42df-ae2c-e93a954701dd',
    invoiceAccountId: invoiceAccount.invoiceAccountId,
    address: {},
    invoiceAccountNumber: invoiceAccount.invoiceAccountNumber,
    billingBatchId,
    financialYearEnding,
    isCredit: false
  }
}
