'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReverseBillingTransactionsService = require('../../../app/services/supplementary-billing/reverse-billing-transactions.service.js')

describe('Reverse Billing Transactions service', () => {
  const transactions = [
    {
      invoiceAccountId: '7190937e-e176-4d50-ae4f-c00c5e76938a',
      invoiceAccountNumber: 'B12345678A',
      name: 'DEBIT',
      isCredit: false,
      status: 'TO_BE_OVERWRITTEN',
      purposes: ['foo']
    }
  ]

  const billingInvoiceLicence = {
    billingInvoiceLicenceId: '8affaa71-c185-4b6c-9814-4c615c235611'
  }

  describe('when the service is called', () => {
    it('returns reversing transactions', () => {
      const result = ReverseBillingTransactionsService.go(transactions, billingInvoiceLicence)

      expect(result.length).to.equal(transactions.length)

      expect(result[0].invoiceAccountId).not.to.exist()
      expect(result[0].invoiceAccountNumber).not.to.exist()

      expect(result[0].name).to.equal('DEBIT')
      expect(result[0].isCredit).to.be.true()
      expect(result[0].status).to.equal('candidate')
      expect(result[0].billingInvoiceLicenceId).to.equal(billingInvoiceLicence.billingInvoiceLicenceId)
      expect(result[0].billingTransactionId).to.exist().and.to.be.a.string()
      expect(result[0].purposes).to.equal('foo')
    })
  })
})
