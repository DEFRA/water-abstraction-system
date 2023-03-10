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

  let generatedBillingInvoices
  let expectedResult
  let invoiceAccount

  beforeEach(async () => {
    await DatabaseHelper.clean()

    invoiceAccount = await InvoiceAccountHelper.add()
  })

  describe('when `generatedBillingInvoices` is empty', () => {
    beforeEach(async () => {
      generatedBillingInvoices = []
      expectedResult = _billingInvoiceGenerator(invoiceAccount, billingBatchId, financialYearEnding)
    })

    it('returns a new billing invoice and an array populated with just it', async () => {
      const result = await GenerateBillingInvoiceService.go(
        generatedBillingInvoices,
        invoiceAccount.invoiceAccountId,
        billingBatchId,
        financialYearEnding
      )

      expect(result.billingInvoice).to.equal(expectedResult, { skip: 'billingInvoiceId' })
      expect(result.billingInvoices).to.equal([result.billingInvoice])
    })
  })

  describe('when `generatedBillingInvoices` is populated', () => {
    describe('and a matching billing invoice exists', () => {
      let existingBillingInvoice

      beforeEach(async () => {
        existingBillingInvoice = _billingInvoiceGenerator(invoiceAccount, billingBatchId, financialYearEnding)
        generatedBillingInvoices = [existingBillingInvoice]
      })

      it('returns the existing billing invoice object and the existing array', async () => {
        const result = await GenerateBillingInvoiceService.go(
          generatedBillingInvoices,
          invoiceAccount.invoiceAccountId,
          billingBatchId,
          financialYearEnding
        )

        expect(result.billingInvoice).to.equal(existingBillingInvoice)
        expect(result.billingInvoices).to.equal(generatedBillingInvoices)
      })
    })

    describe('and a matching billing invoice does not exist', () => {
      let existingBillingInvoice

      beforeEach(() => {
        existingBillingInvoice = _billingInvoiceGenerator(
          { invoiceAccountId: '813b8bb3-f871-49c3-ac2c-0636e636d9f6', invoiceAccountNumber: 'ABC123' },
          billingBatchId,
          financialYearEnding
        )
        generatedBillingInvoices = [existingBillingInvoice]

        expectedResult = _billingInvoiceGenerator(invoiceAccount, billingBatchId, financialYearEnding)
      })

      it('returns a new billing invoice object and the existing array with the new object included', async () => {
        const result = await GenerateBillingInvoiceService.go(
          generatedBillingInvoices,
          invoiceAccount.invoiceAccountId,
          billingBatchId,
          financialYearEnding
        )

        expect(result.billingInvoice).to.equal(expectedResult, { skip: 'billingInvoiceId' })
        expect(result.billingInvoices).to.equal([...generatedBillingInvoices, result.billingInvoice])
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
