'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../../support/helpers/crm-v2/billing-account.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Thing under test
const FetchInvoiceAccountNumbersService = require('../../../../app/services/billing/supplementary/fetch-invoice-account-numbers.service.js')

describe('Fetch Invoice Account Numbers service', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when the service is called with an array of charge version', () => {
    let expectedResult
    let billingAccounts

    beforeEach(async () => {
      // We create three billing accounts but we will only be fetching the first two
      billingAccounts = await Promise.all([
        BillingAccountHelper.add(),
        BillingAccountHelper.add(),
        BillingAccountHelper.add()
      ])

      expectedResult = [
        {
          invoiceAccountId: billingAccounts[0].invoiceAccountId,
          invoiceAccountNumber: billingAccounts[0].invoiceAccountNumber
        },
        {
          invoiceAccountId: billingAccounts[1].invoiceAccountId,
          invoiceAccountNumber: billingAccounts[1].invoiceAccountNumber
        }
      ]
    })

    it('fetches the invoice accounts that the charge versions link to', async () => {
      const result = await FetchInvoiceAccountNumbersService.go([
        { invoiceAccountId: billingAccounts[0].invoiceAccountId },
        { invoiceAccountId: billingAccounts[1].invoiceAccountId }
      ])

      expect(result).to.have.length(2).and.contain(expectedResult)
    })
  })
})
