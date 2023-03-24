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

  const standardTransactions = [
    {
      billingTransactionId: 'STANDARD_TRANSACTION_1',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '4.10.1',
      billableDays: 365
    },
    {
      billingTransactionId: 'STANDARD_TRANSACTION_2',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '5.11.2',
      billableDays: 265
    },
    {
      billingTransactionId: 'STANDARD_TRANSACTION_3',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '6.12.3',
      billableDays: 100
    }
  ]

  const allReversedTransactions = [
    {
      billingTransactionId: 'I_WILL_BE_REMOVED_1',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: true,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '4.10.1',
      billableDays: 365
    },
    {
      billingTransactionId: 'I_WILL_BE_REMOVED_2',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: true,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '5.11.2',
      billableDays: 265
    },
    {
      billingTransactionId: 'I_WILL_BE_REMOVED_3',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '6.12.3',
      billableDays: 100
    },
    {
      billingTransactionId: 'I_WILL_NOT_BE_REMOVED',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '9.9.9',
      billableDays: 180
    }
  ]

  beforeEach(() => {
    Sinon.stub(FetchPreviousBillingTransactionsService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the billing invoice, licence and period', () => {
    describe('match to transactions on a previous billing batch', () => {
      describe('and the standard transactions provided', () => {
        let reversedTransactions

        describe('completely cancel out the previous transactions from the last billing batch', () => {
          beforeEach(() => {
            reversedTransactions = [allReversedTransactions[0], allReversedTransactions[1]]

            Sinon.stub(ReverseBillingTransactionsService, 'go').returns(reversedTransactions)
          })

          it('returns the uncanceled standard transactions', async () => {
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

        describe('partially cancel out the previous transactions from the last billing batch', () => {
          beforeEach(() => {
            reversedTransactions = [allReversedTransactions[0], allReversedTransactions[1], allReversedTransactions[3]]

            Sinon.stub(ReverseBillingTransactionsService, 'go').returns(reversedTransactions)
          })

          it('returns the uncanceled standard and reversed transactions', async () => {
            const result = await ProcessBillingTransactionsService.go(
              standardTransactions,
              billingInvoice,
              billingInvoiceLicence,
              billingPeriod
            )

            expect(result.length).to.equal(2)
            expect(result[0].billingTransactionId).to.equal('STANDARD_TRANSACTION_3')
            expect(result[1].billingTransactionId).to.equal('I_WILL_NOT_BE_REMOVED')
          })
        })

        describe('are cancelled out by the previous transactions from the last billing batch', () => {
          beforeEach(() => {
            reversedTransactions = [allReversedTransactions[0], allReversedTransactions[1], allReversedTransactions[2]]

            Sinon.stub(ReverseBillingTransactionsService, 'go').returns(reversedTransactions)
          })

          it('returns no transactions', async () => {
            const result = await ProcessBillingTransactionsService.go(
              standardTransactions,
              billingInvoice,
              billingInvoiceLicence,
              billingPeriod
            )

            expect(result.length).to.equal(0)
          })
        })
      })
    })

    describe('do not match to transactions on a previous billing batch', () => {
      beforeEach(() => {
        Sinon.stub(ReverseBillingTransactionsService, 'go').returns([])
      })

      it('returns the standard transactions unchanged', async () => {
        const result = await ProcessBillingTransactionsService.go(
          standardTransactions,
          billingInvoice,
          billingInvoiceLicence,
          billingPeriod
        )

        expect(result.length).to.equal(3)
        expect(result[0].billingTransactionId).to.equal('STANDARD_TRANSACTION_1')
        expect(result[1].billingTransactionId).to.equal('STANDARD_TRANSACTION_2')
        expect(result[2].billingTransactionId).to.equal('STANDARD_TRANSACTION_3')
      })
    })
  })
})
