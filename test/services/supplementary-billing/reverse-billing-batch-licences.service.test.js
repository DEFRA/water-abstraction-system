'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReverseBillingBatchLicencesService = require('../../../app/services/supplementary-billing/reverse-billing-batch-licences.service.js')

describe('Reverse Billing Batch Licences service', () => {
  const transactions = [
    {
      name: 'CREDIT',
      isCredit: true,
      status: 'TO_BE_OVERWRITTEN'
    },
    {
      name: 'DEBIT',
      isCredit: false,
      status: 'TO_BE_OVERWRITTEN'
    }
  ]

  const billingInvoiceLicence = {
    billingInvoiceLicenceId: '8affaa71-c185-4b6c-9814-4c615c235611'
  }

  describe('when the service is called', () => {
    it('returns reversing transactions', () => {
      const result = ReverseBillingBatchLicencesService.go(transactions, billingInvoiceLicence)

      const credit = result.find((transaction) => transaction.name === 'CREDIT')
      const debit = result.find((transaction) => transaction.name === 'DEBIT')

      expect(result.length).to.equal(transactions.length)

      expect(credit.isCredit).to.be.false()
      expect(credit.status).to.equal('candidate')
      expect(credit.billingInvoiceLicenceId).to.equal(billingInvoiceLicence.billingInvoiceLicenceId)
      expect(credit.billingTransactionId).to.exist().and.to.be.a.string()

      expect(debit.isCredit).to.be.true()
      expect(debit.status).to.equal('candidate')
      expect(debit.billingInvoiceLicenceId).to.equal(billingInvoiceLicence.billingInvoiceLicenceId)
      expect(debit.billingTransactionId).to.exist().and.to.be.a.string()
    })
  })
})
