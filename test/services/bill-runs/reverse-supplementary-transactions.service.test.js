'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReverseSupplementaryTransactionsService = require('../../../app/services/bill-runs/reverse-supplementary-transactions.service.js')

describe('Bill Runs - Reverse Supplementary Transactions service', () => {
  const transactions = [
    {
      name: 'DEBIT',
      credit: false,
      status: 'TO_BE_OVERWRITTEN',
      purposes: [
        {
          id: '04cbede8-45cf-433e-b4f5-f33dc911ced0',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3
        }
      ]
    }
  ]

  const billLicenceId = '8affaa71-c185-4b6c-9814-4c615c235611'

  describe('when the service is called', () => {
    it('returns reversing transactions', () => {
      const result = ReverseSupplementaryTransactionsService.go(transactions, billLicenceId)

      expect(result).to.have.length(transactions.length)

      expect(result[0].billingAccountId).not.to.exist()
      expect(result[0].accountNumber).not.to.exist()

      expect(result[0].name).to.equal('DEBIT')
      expect(result[0].credit).to.be.true()
      expect(result[0].status).to.equal('candidate')
      expect(result[0].billLicenceId).to.equal('8affaa71-c185-4b6c-9814-4c615c235611')
      expect(result[0].id).to.exist().and.to.be.a.string()
      expect(result[0].purposes).to.equal([
        {
          id: '04cbede8-45cf-433e-b4f5-f33dc911ced0',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3
        }
      ])
    })
  })
})
