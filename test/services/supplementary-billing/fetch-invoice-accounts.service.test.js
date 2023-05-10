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
const FetchInvoiceAccountsService = require('../../../app/services/supplementary-billing/fetch-invoice-accounts.service.js')

describe('Fetch Invoice Accounts service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when the service is called with an array of charge versions', () => {
    let expectedResult
    let invoiceAccounts

    beforeEach(async () => {
      // We create three invoice accounts but we will only be fetching the first two
      invoiceAccounts = await Promise.all([
        await InvoiceAccountHelper.add(),
        await InvoiceAccountHelper.add(),
        await InvoiceAccountHelper.add()
      ])

      expectedResult = [
        invoiceAccounts[0],
        invoiceAccounts[1]
      ]
    })

    it('fetches the invoice accounts that the charge versions link to', async () => {
      const result = await FetchInvoiceAccountsService.go([
        { invoiceAccountId: invoiceAccounts[0].invoiceAccountId },
        { invoiceAccountId: invoiceAccounts[1].invoiceAccountId }
      ])

      expect(result).to.have.length(2).and.contain(expectedResult)
    })
  })
})
