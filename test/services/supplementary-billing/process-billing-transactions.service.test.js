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
const ProcessBillingTransactionsService = require('../../../app/services/supplementary-billing/process-billing-transactions.service.js')

describe('Process billing batch service', () => {
  const billingInvoice = { billingInvoiceId: 'a56ef6d9-370a-4224-b6ec-0fca8bfa4d1f' }
  const billingInvoiceLicence = { billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269' }

  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  const calculatedTransactions = [
    {
      billingTransactionId: '61abdc15-7859-4783-9622-6cb8de7f2461',
      billingInvoiceLicenceId: billingInvoiceLicence.billingInvoiceLicenceId,
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '4.10.1',
      billableDays: 365,
      purposes: 'CALCULATED_TRANSACTION_1'
    },
    {
      billingTransactionId: 'a903cdd3-1804-4237-aeb9-70ef9008469d',
      billingInvoiceLicenceId: billingInvoiceLicence.billingInvoiceLicenceId,
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '5.11.2',
      billableDays: 265,
      purposes: 'CALCULATED_TRANSACTION_2'
    },
    {
      billingTransactionId: '34453414-0ecb-49ce-8442-619d22c882f0',
      billingInvoiceLicenceId: billingInvoiceLicence.billingInvoiceLicenceId,
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '6.12.3',
      billableDays: 100,
      purposes: 'CALCULATED_TRANSACTION_3'
    }
  ]

  const allPreviousTransactions = [
    {
      billingTransactionId: '8d68eb26-d054-47a7-aee8-cd93a24fa860',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '4.10.1',
      billableDays: 365,
      purposes: ['I_WILL_BE_REMOVED_1']
    },
    {
      billingTransactionId: '63742bee-cb1b-44f1-86f6-c7d546f59c88',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '5.11.2',
      billableDays: 265,
      purposes: ['I_WILL_BE_REMOVED_2']
    },
    {
      billingTransactionId: '4f254a70-d36e-46eb-9e4b-59503c3d5994',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '6.12.3',
      billableDays: 100,
      purposes: ['I_WILL_BE_REMOVED_3']
    },
    {
      billingTransactionId: '733bdb55-5386-4fdb-a581-1e98f9a35bed',
      billingInvoiceLicenceId: '110ab2e2-6076-4d5a-a56f-b17a048eb269',
      isCredit: false,
      status: 'candidate',
      chargeType: 'standard',
      chargeCategoryCode: '9.9.9',
      billableDays: 180,
      purposes: ['I_WILL_NOT_BE_REMOVED']
    }
  ]

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the billing invoice, licence and period', () => {
    describe('match to transactions on a previous billing batch', () => {
      describe('and the calculated transactions provided', () => {
        let previousTransactions

        describe('completely cancel out the previous transactions from the last billing batch', () => {
          beforeEach(() => {
            previousTransactions = [allPreviousTransactions[0], allPreviousTransactions[1]]

            Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns the uncanceled calculated transactions', async () => {
            const result = await ProcessBillingTransactionsService.go(
              calculatedTransactions,
              billingInvoice,
              billingInvoiceLicence,
              billingPeriod
            )

            expect(result.length).to.equal(1)
            expect(result[0]).to.equal(calculatedTransactions[2])
          })
        })

        describe('partially cancel out the previous transactions from the last billing batch', () => {
          beforeEach(() => {
            previousTransactions = [allPreviousTransactions[0], allPreviousTransactions[1], allPreviousTransactions[3]]

            Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns the uncanceled calculated and reversed transactions', async () => {
            const result = await ProcessBillingTransactionsService.go(
              calculatedTransactions,
              billingInvoice,
              billingInvoiceLicence,
              billingPeriod
            )

            expect(result.length).to.equal(2)
            expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION_3')
            expect(result[1].purposes).to.equal('I_WILL_NOT_BE_REMOVED')
          })
        })

        describe('are cancelled out by the previous transactions from the last billing batch', () => {
          beforeEach(() => {
            previousTransactions = [allPreviousTransactions[0], allPreviousTransactions[1], allPreviousTransactions[2]]

            Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves(previousTransactions)
          })

          it('returns no transactions', async () => {
            const result = await ProcessBillingTransactionsService.go(
              calculatedTransactions,
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
        Sinon.stub(FetchPreviousBillingTransactionsService, 'go').resolves([])
      })

      it('returns the calculated transactions unchanged', async () => {
        const result = await ProcessBillingTransactionsService.go(
          calculatedTransactions,
          billingInvoice,
          billingInvoiceLicence,
          billingPeriod
        )

        expect(result.length).to.equal(3)
        expect(result[0].purposes).to.equal('CALCULATED_TRANSACTION_1')
        expect(result[1].purposes).to.equal('CALCULATED_TRANSACTION_2')
        expect(result[2].purposes).to.equal('CALCULATED_TRANSACTION_3')
      })
    })
  })
})
