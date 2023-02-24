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
const FetchInvoiceAccountService = require('../../../app/services/supplementary-billing/fetch-invoice-account.service.js')

describe('Fetch Invoice Account service', () => {
  let testInvoiceAccount

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there is an invoice account with a matching invoice account id', () => {
    beforeEach(async () => {
      testInvoiceAccount = await InvoiceAccountHelper.add()
    })

    it('returns results', async () => {
      const result = await FetchInvoiceAccountService.go(testInvoiceAccount.invoiceAccountId)

      expect(result.invoiceAccountId).to.equal(testInvoiceAccount.invoiceAccountId)
    })
  })

  describe('when there is no invoice account with a matching invoice account id', () => {
    beforeEach(async () => {
      InvoiceAccountHelper.add()
    })

    it('returns no results', async () => {
      // A random uuid that will not exist in the invoice account table
      const invoiceAccountId = 'f0b835d6-129a-4d90-a3b6-c59bc28d661d'

      const result = await FetchInvoiceAccountService.go(invoiceAccountId)

      expect(result).to.be.undefined()
    })
  })
})
