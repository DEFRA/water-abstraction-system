'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewMinimumChargeTransactionPresenter = require('../../../app/presenters/bill-licences/view-minimum-charge-transaction.presenter.js')

describe('View Minimum Charge Transaction presenter', () => {
  let transaction

  describe('when provided with a minimum charge transaction', () => {
    beforeEach(() => {
      transaction = {
        chargeType: 'minimum_charge',
        netAmount: 2401
      }
    })

    describe('that is a credit', () => {
      beforeEach(() => {
        transaction.credit = true
      })

      it('returns the credit property populated and the debit empty', () => {
        const result = ViewMinimumChargeTransactionPresenter.go(transaction)

        expect(result.creditAmount).to.equal('£24.01')
        expect(result.debitAmount).to.equal('')
      })
    })

    describe('that is a debit', () => {
      beforeEach(() => {
        transaction.credit = false
      })

      it('returns the debit property populated and the credit empty', () => {
        const result = ViewMinimumChargeTransactionPresenter.go(transaction)

        expect(result.creditAmount).to.equal('')
        expect(result.debitAmount).to.equal('£24.01')
      })
    })

    it('correctly presents the data', () => {
      const result = ViewMinimumChargeTransactionPresenter.go(transaction)

      expect(result).to.equal({
        billableDays: '',
        chargeType: 'minimum_charge',
        creditAmount: '',
        debitAmount: '£24.01',
        description: 'Minimum charge',
        quantity: ''
      })
    })
  })
})
