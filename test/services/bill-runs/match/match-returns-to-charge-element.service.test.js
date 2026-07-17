// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import MatchReturnsToChargeElementService from '../../../../app/services/bill-runs/match/match-returns-to-charge-element.service.js'

describe('Match Returns To Charge Element Service', () => {
  let chargeElement
  let returnLogs

  beforeEach(() => {
    chargeElement = {
      id: '8eac5976-d16c-4818-8bc8-384d958ce863',
      purpose: {
        id: 'f3872a42-b91b-4c58-887a-ef09dda686fd',
        legacyId: '400',
        description: 'Spray Irrigation - Direct'
      },
      returnLogs: [],
      abstractionPeriods: [
        {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2022-10-31')
        },
        {
          startDate: new Date('2023-03-01'),
          endDate: new Date('2023-03-31')
        }
      ]
    }
  })

  describe('when the return logs all match', () => {
    beforeEach(() => {
      returnLogs = _testReturnLogs()
    })

    it('adds the matching return logs to the charge element', () => {
      MatchReturnsToChargeElementService(chargeElement, returnLogs)

      expect(chargeElement).toEqual({
        abstractionPeriods: [
          {
            endDate: new Date('2022-10-31'),
            startDate: new Date('2022-04-01')
          },
          {
            endDate: new Date('2023-03-31'),
            startDate: new Date('2023-03-01')
          }
        ],
        id: '8eac5976-d16c-4818-8bc8-384d958ce863',
        purpose: {
          description: 'Spray Irrigation - Direct',
          id: 'f3872a42-b91b-4c58-887a-ef09dda686fd',
          legacyId: '400'
        },
        returnLogs: [
          {
            allocatedQuantity: 0,
            returnLogId: '870c6cae-1f31-4e0e-bdd1-4df07b31084e'
          },
          {
            allocatedQuantity: 0,
            returnLogId: '9341b05c-b24d-4c03-b5e3-fa19950b04d0'
          }
        ]
      })
    })

    it('changes the matched property on the return log to be true', () => {
      MatchReturnsToChargeElementService(chargeElement, returnLogs)

      expect(returnLogs[0].matched).toBe(true)
    })
  })

  describe('when some return logs do not match', () => {
    describe('because the purposes are different', () => {
      beforeEach(() => {
        returnLogs = _testReturnLogs()
        returnLogs[1].purposes[0].tertiary.code = '600'
      })

      it('records only the matching return logs against the charge element', () => {
        MatchReturnsToChargeElementService(chargeElement, returnLogs)

        expect(chargeElement.returnLogs).toEqual([
          {
            allocatedQuantity: 0,
            returnLogId: '870c6cae-1f31-4e0e-bdd1-4df07b31084e'
          }
        ])
      })

      it('only flags the matching return logs as "matched"', () => {
        MatchReturnsToChargeElementService(chargeElement, returnLogs)

        expect(returnLogs[0].matched).toBe(true)
        expect(returnLogs[1].matched).toBe(false)
      })
    })

    describe('because the abstraction periods are different', () => {
      beforeEach(() => {
        returnLogs = _testReturnLogs()

        returnLogs[1].abstractionPeriods[0].startDate = new Date('2022-11-01')
        returnLogs[1].abstractionPeriods[0].endDate = new Date('2022-12-31')
      })

      it('records only the matching return logs against the charge element', () => {
        MatchReturnsToChargeElementService(chargeElement, returnLogs)

        expect(chargeElement.returnLogs).toEqual([
          {
            allocatedQuantity: 0,
            returnLogId: '870c6cae-1f31-4e0e-bdd1-4df07b31084e'
          }
        ])
      })

      it('only flags the matching return logs as "matched"', () => {
        MatchReturnsToChargeElementService(chargeElement, returnLogs)

        expect(returnLogs[0].matched).toBe(true)
        expect(returnLogs[1].matched).toBe(false)
      })
    })
  })

  describe('when no return logs match', () => {
    beforeEach(() => {
      returnLogs = _testReturnLogs()
      returnLogs[0].purposes[0].tertiary.code = '600'
      returnLogs[1].purposes[0].tertiary.code = '600'
    })

    it('adds no matching return logs to the charge element', () => {
      MatchReturnsToChargeElementService(chargeElement, returnLogs)

      expect(chargeElement.returnLogs).toHaveLength(0)
    })

    it('leaves the matched property on the return logs as false', () => {
      MatchReturnsToChargeElementService(chargeElement, returnLogs)

      expect(returnLogs[0].matched).toBe(false)
      expect(returnLogs[1].matched).toBe(false)
    })
  })
})

// All data not required for the tests has been excluded from the generated data
function _testReturnLogs() {
  return [
    {
      id: '870c6cae-1f31-4e0e-bdd1-4df07b31084e',
      purposes: [
        {
          alias: 'Spray Irrigation - Direct',
          primary: { code: 'A', description: 'Agriculture' },
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
          secondary: { code: 'AGR', description: 'General Agriculture' }
        }
      ],
      abstractionPeriods: [
        {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2022-10-31')
        }
      ],
      matched: false,
      reviewReturnId: '5f86823b-2384-48ca-b20f-e0f178122a0f'
    },
    {
      id: '9341b05c-b24d-4c03-b5e3-fa19950b04d0',
      purposes: [
        {
          alias: 'Spray Irrigation - Direct',
          primary: { code: 'A', description: 'Agriculture' },
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
          secondary: { code: 'AGR', description: 'General Agriculture' }
        }
      ],
      abstractionPeriods: [
        {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2022-10-31')
        }
      ],
      matched: false
    }
  ]
}
