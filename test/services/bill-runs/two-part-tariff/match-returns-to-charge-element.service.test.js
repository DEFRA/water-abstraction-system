'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const MatchReturnsToChargeElementService = require('../../../../app/services/bill-runs/two-part-tariff/match-returns-to-charge-element.service.js')

describe.only('Match Returns to Charge Element service', () => {
  describe('when given a charge element', () => {
    let chargeElement
    let returnLogs

    beforeEach(() => {
      chargeElement =
      {
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

    describe('and return logs that all match', () => {
      beforeEach(() => {
        const purpose1 = '400'
        returnLogs = _setUpReturnLogs(purpose1, purpose1)
      })

      it('adds the matching return logs to the charge element', () => {
        MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

        expect(chargeElement).to.equal({
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
              returnId: 'v1:6:11/42/18.6.3/295:10055412:2021-11-01:2022-10-31'
            },
            {
              allocatedQuantity: 0,
              returnId: 'v1:6:11/42/18.6.3/295:10055412:2021-11-01:2023-10-01'
            }
          ]
        })
      })

      it('changes the matched property on the return log to be true', () => {
        MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

        expect(returnLogs[0].matched).to.be.true()
      })
    })

    describe('and return logs that partially match', () => {
      beforeEach(() => {
        const purpose1 = '400'
        const purpose2 = '600'
        returnLogs = _setUpReturnLogs(purpose1, purpose2)
      })

      it('for the matching return logs adds them to the charge element', () => {
        MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

        expect(chargeElement).to.equal({
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
              returnId: 'v1:6:11/42/18.6.3/295:10055412:2021-11-01:2022-10-31'
            }
          ]
        })
      })

      it('changes the matched property to true for the matching return logs', () => {
        MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

        expect(returnLogs[0].matched).to.be.true()
      })

      it('keeps the matched property as false for any unmatched return logs', () => {
        MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

        expect(returnLogs[1].matched).to.be.false()
      })
    })

    describe('and return logs that do not match', () => {
      beforeEach(() => {
        const purpose1 = '600'
        const purpose2 = '600'
        returnLogs = _setUpReturnLogs(purpose1, purpose2)
      })

      it('does not add the return logs to the charge element', () => {
        MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

        expect(chargeElement).to.equal({
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
          returnLogs: []
        })
      })

      it('does not change the matched property on the return logs', () => {
        MatchReturnsToChargeElementService.go(chargeElement, returnLogs)

        expect(returnLogs[0].matched).to.be.false()
        expect(returnLogs[1].matched).to.be.false()
      })
    })
  })
})

function _setUpReturnLogs (purpose1, purpose2) {
  // All data not required for the tests has been excluded from the generated data
  return [
    {
      id: 'v1:6:11/42/18.6.3/295:10055412:2021-11-01:2022-10-31',
      purposes: [
        {
          alias: 'Spray Irrigation - Direct',
          primary: { code: 'A', description: 'Agriculture' },
          tertiary: { code: purpose1, description: 'Spray Irrigation - Direct' },
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
      reviewReturnResultId: '5f86823b-2384-48ca-b20f-e0f178122a0f'
    },
    {
      id: 'v1:6:11/42/18.6.3/295:10055412:2021-11-01:2023-10-01',
      purposes: [
        {
          alias: 'Spray Irrigation - Direct',
          primary: { code: 'A', description: 'Agriculture' },
          tertiary: { code: purpose2, description: 'Spray Irrigation - Direct' },
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
