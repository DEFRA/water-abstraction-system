'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PrepareChargeVersionService = require('../../../../app/services/bill-runs/match/prepare-charge-version.service.js')

describe('Prepare Charge Version Service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  describe('when given a charge version', () => {
    let chargeVersion

    beforeEach(async () => {
      chargeVersion = _testChargeVersion()
    })

    it('sorts the charge references by their subsistence charge', async () => {
      await PrepareChargeVersionService.go(chargeVersion, billingPeriod)

      expect(chargeVersion.chargeReferences[0].chargeCategory.subsistenceCharge).to.equal(70000)
      expect(chargeVersion.chargeReferences[1].chargeCategory.subsistenceCharge).to.equal(68400)
    })

    it('preps the charge elements correctly', async () => {
      await PrepareChargeVersionService.go(chargeVersion, billingPeriod)

      expect(chargeVersion.chargeReferences[0].chargeElements[0]).to.equal({
        id: '8eac5976-d16c-4818-8bc8-384d958ce863',
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 3,
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 10,
        authorisedAnnualQuantity: 32,
        returnLogs: [],
        allocatedQuantity: 0,
        abstractionPeriods: [
          {
            startDate: new Date('2022-04-01'),
            endDate: new Date(' 2022-10-31')
          },
          {
            startDate: new Date('2023-03-01'),
            endDate: new Date('2023-03-31')
          }
        ]
      })
    })
  })
})

// All data not required for the tests has been excluded from the generated data
function _testChargeVersion() {
  return {
    id: 'aad7de5b-d684-4980-bcb7-e3b631d3036f',
    startDate: new Date('2022-04-01'),
    endDate: null,
    licence: {
      id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      licenceRef: '5/31/14/*S/0116A',
      startDate: new Date('1966-02-01T00:00:00.000Z')
    },
    chargeReferences: [
      {
        id: '4e7f1824-3680-4df0-806f-c6d651ba4771',
        chargeCategory: {
          reference: '4.5.12',
          shortDescription:
            'Medium loss, non-tidal, restricted water, greater than 25 up to and including 83 ML/yr, Tier 2 model',
          subsistenceCharge: 68400
        },
        chargeElements: [
          {
            id: '8eac5976-d16c-4818-8bc8-384d958ce863',
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 3,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            authorisedAnnualQuantity: 32
          }
        ]
      },
      {
        id: '6e7f1824-3680-4df0-806f-c6d651ba4771',
        chargeCategory: {
          reference: '4.5.12',
          shortDescription:
            'Medium loss, non-tidal, restricted water, greater than 25 up to and including 83 ML/yr, Tier 2 model',
          subsistenceCharge: 70000
        },
        chargeElements: [
          {
            id: '8eac5976-d16c-4818-8bc8-384d958ce863',
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 3,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            authorisedAnnualQuantity: 32
          }
        ]
      }
    ]
  }
}
