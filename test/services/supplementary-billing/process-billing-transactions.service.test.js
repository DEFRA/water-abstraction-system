'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchPreviousBillingTransactionsService = require('../../../app/services/supplementary-billing/fetch-previous-billing-transactions.service.js')
const ReverseBillingTransactionsService = require('../../../app/services/supplementary-billing/reverse-billing-transactions.service.js')

// Thing under test
const ProcessBillingTransactionsService = require('../../../app/services/supplementary-billing/process-billing-transactions.service.js')

describe('Process billing batch service', () => {
  const billingInvoice = 'BILLING_INVOICE'
  const billingInvoiceLicence = 'BILLING_INVOICE_LICENCE'

  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  beforeEach(() => {
    const reversedTransactions = [
      {
        billingTransactionId: 'ad13d58d-a0ee-414d-9f3c-26e65b697f6b',
        billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
        isCredit: true,
        status: 'candidate',
        chargetype: 'standard',
        chargeCategoryCode: '4.10.1',
        billableDays: 365
      },
      {
        billingTransactionId: '547a38c3-effe-4e98-aa0a-718d34a6a5e1',
        billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
        isCredit: true,
        status: 'candidate',
        chargetype: 'standard',
        chargeCategoryCode: '5.11.2',
        billableDays: 265
      }
    ]

    Sinon.stub(FetchPreviousBillingTransactionsService, 'go')
    Sinon.stub(ReverseBillingTransactionsService, 'go').returns(reversedTransactions)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    let standardTransactions

    beforeEach(() => {
      standardTransactions = [
        {
          billingTransactionId: 'ad13d58d-a0ee-414d-9f3c-26e65b697f6b',
          billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
          isCredit: false,
          status: 'candidate',
          chargetype: 'standard',
          chargeCategoryCode: '4.10.1',
          billableDays: 365
        },
        {
          billingTransactionId: '547a38c3-effe-4e98-aa0a-718d34a6a5e1',
          billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
          isCredit: false,
          status: 'candidate',
          chargetype: 'standard',
          chargeCategoryCode: '5.11.2',
          billableDays: 265
        },
        {
          billingTransactionId: 'b0c23af4-6369-4a51-9192-b82b0ac3456f',
          billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
          isCredit: false,
          status: 'candidate',
          chargetype: 'standard',
          chargeCategoryCode: '6.12.3',
          billableDays: 100
        }
      ]
    })
    it('returns transactions with cancelling transactions removed', async () => {
      const result = await ProcessBillingTransactionsService.go(
        standardTransactions,
        billingInvoice,
        billingInvoiceLicence,
        billingPeriod
      )

      expect(result.length).to.equal(1)
      expect(result[0]).to.equal(standardTransactions[2])
    })
  })
})
