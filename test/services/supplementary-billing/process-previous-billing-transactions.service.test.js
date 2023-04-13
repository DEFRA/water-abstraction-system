'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchPreviousBillingTransactionsService = require('../../../app/services/supplementary-billing/fetch-previous-billing-transactions.service.js')

// Thing under test
const ProcessPreviousBillingTransactionsService = require('../../../app/services/supplementary-billing/process-previous-billing-transactions.service.js')

describe('Process previous billing transactions service', () => {
  const billingInvoice = { billingInvoiceId: 'a56ef6d9-370a-4224-b6ec-0fca8bfa4d1f' }
  const billingInvoiceLicence = { billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269' }

  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  const previousTransaction = {
    billingTransactionId: '63742bee-cb1b-44f1-86f6-c7d546f59c88',
    billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
    isCredit: false,
    status: 'candidate',
    chargeType: 'standard',
    chargeCategoryCode: '5.11.2',
    billableDays: 265,
    purposes: []
  }

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the billing invoice, licence and period', () => {
    describe('match to transactions on a previous billing batch', () => {
      beforeEach(() => {
        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves([previousTransaction])
      })

      it('returns the debits reversed as credits with new Ids', async () => {
        const result = await ProcessPreviousBillingTransactionsService.go(
          billingInvoice,
          billingInvoiceLicence,
          billingPeriod
        )

        expect(result.length).to.equal(1)
        expect(result[0].billingTransactionId).not.to.equal(previousTransaction.billingTransactionId)
        expect(result[0].isCredit).not.to.equal(previousTransaction.isCredit)
      })
    })

    describe('do not match to transactions on a previous billing batch', () => {
      beforeEach(() => {
        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves([])
      })

      it('returns an empty array', async () => {
        const result = await ProcessPreviousBillingTransactionsService.go(
          billingInvoice,
          billingInvoiceLicence,
          billingPeriod
        )

        expect(result).to.be.empty()
      })
    })
  })
})
