'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewCompensationChargeTransactionPresenter = require('../../../app/presenters/bill-licences/view-compensation-charge-transaction.presenter.js')

describe('View Compensation Charge Transaction presenter', () => {
  let transaction

  describe('when provided with a compensation charge transaction', () => {
    beforeEach(() => {
      transaction = {
        authorisedDays: 214,
        billableDays: 153,
        chargeType: 'compensation',
        endDate: new Date('2024-03-31'),
        credit: false,
        netAmount: 21474,
        scheme: 'sroc',
        section127Agreement: false,
        startDate: new Date('2023-04-01'),
        volume: 100
      }
    })

    describe('that is a credit', () => {
      beforeEach(() => {
        transaction.credit = true
      })

      it('returns the credit property populated and the debit empty', () => {
        const result = ViewCompensationChargeTransactionPresenter.go(transaction)

        expect(result.creditAmount).to.equal('£214.74')
        expect(result.debitAmount).to.equal('')
      })
    })

    describe('that is a debit', () => {
      beforeEach(() => {
        transaction.credit = false
      })

      it('returns the debit property populated and the credit empty', () => {
        const result = ViewCompensationChargeTransactionPresenter.go(transaction)

        expect(result.creditAmount).to.equal('')
        expect(result.debitAmount).to.equal('£214.74')
      })
    })

    describe('that is for SROC', () => {
      it('correctly presents the data', () => {
        const result = ViewCompensationChargeTransactionPresenter.go(transaction)

        expect(result).to.equal({
          billableDays: '153/214',
          chargePeriod: '1 April 2023 to 31 March 2024',
          chargeType: 'compensation',
          creditAmount: '',
          debitAmount: '£214.74',
          description: 'Compensation charge',
          quantity: '100ML'
        })
      })
    })

    describe('that is for PRESROC', () => {
      beforeEach(() => {
        transaction.scheme = 'alcs'
      })

      describe('the "agreement" property', () => {
        describe('when the transaction is two-part tariff', () => {
          beforeEach(() => {
            transaction.section127Agreement = true
          })

          it('returns "Two-part tariff"', () => {
            const result = ViewCompensationChargeTransactionPresenter.go(transaction)

            expect(result.agreement).to.equal('Two-part tariff')
          })
        })

        describe('when the transaction is not two-part tariff', () => {
          it('returns null', () => {
            const result = ViewCompensationChargeTransactionPresenter.go(transaction)

            expect(result.agreement).to.be.null()
          })
        })
      })

      it('correctly presents the data', () => {
        const result = ViewCompensationChargeTransactionPresenter.go(transaction)

        expect(result).to.equal({
          agreement: null,
          billableDays: '153/214',
          chargePeriod: '1 April 2023 to 31 March 2024',
          chargeType: 'compensation',
          creditAmount: '',
          debitAmount: '£214.74',
          description: 'Compensation charge',
          quantity: '100ML'
        })
      })
    })
  })
})
