'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingInvoiceModel = require('../../../app/models/water/billing-invoice.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')

// Thing under test
const CreateBillingInvoiceService = require('../../../app/services/supplementary-billing/create-billing-invoice.service.js')

describe('Create Billing Invoice service', () => {
  const billingBatchId = '95177485-bfe7-48ed-b2f0-dba5a5084b45'
  const billingPeriod = { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  it('returns the new billing invoice instance containing the correct data', async () => {
    const invoiceAccount = await InvoiceAccountHelper.add({ invoiceAccountNumber: 'TEST12345A' })
    const chargeVersion = { invoiceAccountId: invoiceAccount.invoiceAccountId }

    const result = await CreateBillingInvoiceService.go(chargeVersion, billingPeriod, billingBatchId)

    expect(result).to.be.an.instanceOf(BillingInvoiceModel)

    expect(result.invoiceAccountId).to.equal(invoiceAccount.invoiceAccountId)
    expect(result.address).to.equal({})
    expect(result.invoiceAccountNumber).to.equal(invoiceAccount.invoiceAccountNumber)
    expect(result.billingBatchId).to.equal(billingBatchId)
    expect(result.financialYearEnding).to.equal(2023)
  })
})
