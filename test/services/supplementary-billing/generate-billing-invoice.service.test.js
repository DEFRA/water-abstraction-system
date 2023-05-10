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

  let expectedResult
  let invoiceAccount

  beforeEach(async () => {
    await DatabaseHelper.clean()

    invoiceAccount = await InvoiceAccountHelper.add()

    expectedResult = {
      invoiceAccountId: invoiceAccount.invoiceAccountId,
      address: {},
      invoiceAccountNumber: invoiceAccount.invoiceAccountNumber,
      billingBatchId,
      financialYearEnding,
      isCredit: false
    }
  })

  describe('when called', () => {
    it('returns a new billing invoice with the provided values', () => {
      const result = GenerateBillingInvoiceService.go(
        invoiceAccount,
        billingBatchId,
        financialYearEnding
      )

      expect(result).to.equal(expectedResult, { skip: 'billingInvoiceId' })
      // Separate check for billingInvoiceId as it will be a random UUID
      expect(result.billingInvoiceId).to.be.a.string().and.to.have.length(36)
    })
  })
})
