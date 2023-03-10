'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')

// Thing under test
const GenerateBillingInvoiceService = require('../../../app/services/supplementary-billing/generate-billing-invoice.service.js')

describe('Generate billing invoice service', () => {
  const billingBatchId = 'f4fb6257-c50f-46ea-80b0-7533423d6efd'

  let generatedBillingInvoices
  let expectedResult
  let invoiceAccount

  describe('when `generatedBillingInvoices` is empty', () => {
    beforeEach(async () => {
      invoiceAccount = await InvoiceAccountHelper.add()
      generatedBillingInvoices = []
      expectedResult = _billingInvoiceGenerator(
        invoiceAccount.invoiceAccountId,
        invoiceAccount.invoiceAccountNumber,
        billingBatchId,
        2023
      )
    })

    it('returns a new billing invoice and an array populated with just it', async () => {
      const result = await GenerateBillingInvoiceService.go(
        generatedBillingInvoices,
        invoiceAccount.invoiceAccountId,
        billingBatchId,
        2023
      )

      expect(result.billingInvoice).to.equal(expectedResult, { skip: 'billingInvoiceId' })
      expect(result.billingInvoices).to.equal([result.billingInvoice])
    })
  })

  describe('when `generatedBillingInvoices` is populated', () => {
    describe.only('and a matching billing invoice exists', () => {
      let existingBillingInvoice

      beforeEach(async () => {
        invoiceAccount = await InvoiceAccountHelper.add()
        existingBillingInvoice = _billingInvoiceGenerator(
          invoiceAccount.invoiceAccountId,
          invoiceAccount.invoiceAccountNumber,
          billingBatchId,
          2023
        )
        generatedBillingInvoices = [existingBillingInvoice]
      })

      it('returns the existing billing invoice object and the existing array', () => {
        const result = GenerateBillingInvoiceService.go(
          generatedBillingInvoices,
          invoiceAccount.invoiceAccountId,
          billingBatchId,
          2023
        )

        expect(result.billingInvoice).to.equal(existingBillingInvoice)
        expect(result.billingInvoices).to.equal(generatedBillingInvoices)
      })
    })

    describe('and a matching billing invoice licence does not exist', () => {
      let existingBillingInvoiceLicence

      beforeEach(() => {
        existingBillingInvoiceLicence = _billingInvoiceLicenceGenerator('d0761e82-9c96-4304-9b4c-3c5d4c1af8bb', licence)
        generatedBillingInvoiceLicences = [existingBillingInvoiceLicence]

        expectedResult = _billingInvoiceLicenceGenerator(billingInvoiceId, licence)
      })

      it('returns a new billing invoice licence object and the existing array with the new object included', () => {
        const result = GenerateBillingInvoiceLicenceService.go(generatedBillingInvoiceLicences, billingInvoiceId, licence)

        expect(result.billingInvoiceLicence).to.equal(expectedResult, { skip: 'billingInvoiceLicenceId' })
        expect(result.billingInvoiceLicences).to.equal([...generatedBillingInvoiceLicences, result.billingInvoiceLicence])
      })
    })
  })
})

function _billingInvoiceGenerator (invoiceAccountId, invoiceAccountNumber, billingBatchId, financialYearEnding) {
  return {
    billingInvoiceId: 'fa0c763e-3976-42df-ae2c-e93a954701dd',
    invoiceAccountId,
    address: {},
    invoiceAccountNumber,
    billingBatchId,
    financialYearEnding,
    isCredit: false
  }
}
