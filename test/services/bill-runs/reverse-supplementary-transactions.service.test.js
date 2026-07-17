// Test framework
import { describe, expect, it } from 'vitest'

// Thing under test
import ReverseSupplementaryTransactionsService from '../../../app/services/bill-runs/reverse-supplementary-transactions.service.js'

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
      const result = ReverseSupplementaryTransactionsService(transactions, billLicenceId)

      expect(result).toHaveLength(transactions.length)

      expect(result[0].billingAccountId).toBeUndefined()
      expect(result[0].accountNumber).toBeUndefined()

      expect(result[0].name).toEqual('DEBIT')
      expect(result[0].credit).toBe(true)
      expect(result[0].status).toEqual('candidate')
      expect(result[0].billLicenceId).toEqual('8affaa71-c185-4b6c-9814-4c615c235611')
      expect(result[0].id).toBeDefined()
      expect(result[0].id).toBeTypeOf('string')
      expect(result[0].purposes).toEqual([
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
