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
const FetchInvoiceAccountNumbersService = require('../../../app/services/supplementary-billing/fetch-invoice-account-numbers.service.js')

describe('Fetch Invoice Account Numbers service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when the service is called with an array of charge versions', () => {
    let expectedResult
    let invoiceAccounts

    beforeEach(async () => {
      // We create three invoice accounts but we will only be fetching the first two
      invoiceAccounts = await Promise.all([
        InvoiceAccountHelper.add(),
        InvoiceAccountHelper.add(),
        InvoiceAccountHelper.add()
      ])

      expectedResult = [
        {
          invoiceAccountId: invoiceAccounts[0].invoiceAccountId,
          invoiceAccountNumber: invoiceAccounts[0].invoiceAccountNumber
        },
        {
          invoiceAccountId: invoiceAccounts[1].invoiceAccountId,
          invoiceAccountNumber: invoiceAccounts[1].invoiceAccountNumber
        }
      ]
    })

    it('fetches the invoice accounts that the charge versions link to', async () => {
      const result = await FetchInvoiceAccountNumbersService.go([
        { invoiceAccountId: invoiceAccounts[0].invoiceAccountId },
        { invoiceAccountId: invoiceAccounts[1].invoiceAccountId }
      ])

      expect(result).to.have.length(2).and.contain(expectedResult)
    })
  })
})
