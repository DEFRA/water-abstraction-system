'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingTransactionModel = require('../../../app/models/water/billing-transaction.model.js')

// Thing under test
const CreateBillingTransactionService = require('../../../app/services/supplementary-billing/create-billing-transaction.service.js')

describe('Create billing transaction service', () => {
  const transactionData = {
    billingInvoiceLicenceId: '7190937e-e176-4d50-ae4f-c00c5e76938a',
    description: 'River Beult at Boughton Monchelsea'
  }

  describe('when an object containing the transaction data is provided', () => {
    it('returns the new billing transaction instance', async () => {
      const result = await CreateBillingTransactionService.go(transactionData)

      expect(result).to.be.an.instanceOf(BillingTransactionModel)

      expect(result.billingTransactionId).to.exist()
      expect(result.billingInvoiceLicenceId).to.equal(transactionData.billingInvoiceLicenceId)
      expect(result.description).to.equal(transactionData.description)
    })
  })
})
