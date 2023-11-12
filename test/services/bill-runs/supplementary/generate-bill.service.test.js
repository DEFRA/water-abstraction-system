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
const GenerateBillService = require('../../../../app/services/bill-runs/supplementary/generate-bill.service.js')

describe('Generate Bill service', () => {
  const billRunId = 'f4fb6257-c50f-46ea-80b0-7533423d6efd'
  const financialYearEnding = 2023

  let expectedResult
  let billingAccount

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingAccount = await BillingAccountHelper.add()

    expectedResult = {
      invoiceAccountId: billingAccount.invoiceAccountId,
      address: {},
      invoiceAccountNumber: billingAccount.invoiceAccountNumber,
      billingBatchId: billRunId,
      financialYearEnding,
      isCredit: false
    }
  })

  describe('when called', () => {
    it('returns a new bill with the provided values', () => {
      const result = GenerateBillService.go(
        billingAccount,
        billRunId,
        financialYearEnding
      )

      expect(result).to.equal(expectedResult, { skip: 'billingInvoiceId' })
      // Separate check for billingInvoiceId as it will be a random UUID
      expect(result.billingInvoiceId).to.be.a.string().and.to.have.length(36)
    })
  })
})
