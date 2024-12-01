'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')

describe('Return Logs - Generate Return Log service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let clock
  let returnCycle
  let returnRequirement

  beforeEach(() => {
    returnCycle = _returnCycle()

    returnRequirement = _returnRequirement()
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))
    })

    it('returns the generated return log data', () => {
      const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

      expect(result).to.equal({
        dueDate: new Date('2025-04-28'),
        endDate: new Date('2025-03-31'),
        id: 'v1:4:01/25/90/3242:16999651:2024-04-01:2025-03-31',
        licenceRef: '01/25/90/3242',
        metadata: {
          description: 'BOREHOLE AT AVALON',
          isCurrent: true,
          isFinal: false,
          isSummer: false,
          isTwoPartTariff: false,
          isUpload: false,
          nald: {
            regionCode: 4,
            areaCode: 'SAAR',
            formatId: 16999651,
            periodStartDay: '1',
            periodStartMonth: '4',
            periodEndDay: '31',
            periodEndMonth: '3'
          },
          points: [
            {
              name: 'Winter cycle - live licence - live return version - winter return requirement',
              ngr1: 'TG 713 291',
              ngr2: null,
              ngr3: null,
              ngr4: null
            }
          ],
          purposes: [
            {
              alias: 'Purpose alias for testing',
              primary: { code: 'A', description: 'Agriculture' },
              secondary: { code: 'AGR', description: 'General Agriculture' },
              tertiary: { code: '140', description: 'General Farming & Domestic' }
            }
          ],
          version: 1
        },
        returnCycleId: '6889b98d-964f-4966-b6d6-bf511d6526a1',
        returnReference: '16999651',
        returnsFrequency: 'day',
        source: 'WRLS',
        startDate: new Date('2024-04-01'),
        status: 'due'
      })
    })

    describe('the "endDate" property', () => {
      beforeEach(() => {
        returnRequirement.returnVersion.endDate = new Date('2024-08-31')
      })

      // NOTE: We only add one test scenario to highlight the behaviour behind this property. It makes use of the helper
      // `determineEarliestDate()` which already has a suite of tests
      it('returns the earliest end date from the licence, return version, or return cycle', () => {
        const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

        expect(result.endDate).to.equal(new Date('2024-08-31'))
      })
    })

    describe('the "id" property', () => {
      it('returns a unique identifier built from the region code, licence reference, legacy ID, start and end date', () => {
        const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

        expect(result.id).to.equal(`v1:4:01/25/90/3242:16999651:2024-04-01:2025-03-31`)
      })
    })

    describe('the "metadata" property', () => {
      describe('the metadata "isCurrent" property', () => {
        describe('when the return version "reason" is "succession-or-transfer-of-licence"', () => {
          beforeEach(() => {
            returnRequirement.returnVersion.reason = 'succession-or-transfer-of-licence'
          })

          it('returns false', () => {
            const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

            expect(result.metadata.isCurrent).to.be.false()
          })
        })

        describe('when the return version "reason" is not "succession-or-transfer-of-licence"', () => {
          it('returns true', () => {
            const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

            expect(result.metadata.isCurrent).to.be.true()
          })
        })
      })

      describe('the metadata "isFinal" property', () => {
        describe('when the calculated end date is less than the cycle end date', () => {
          beforeEach(() => {
            returnRequirement.returnVersion.endDate = new Date('2024-05-01')
            returnRequirement.summer = true
          })

          it('returns true', () => {
            const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

            expect(result.metadata.isFinal).to.be.true()
          })
        })

        describe('when the calculated end date is greater than or equal to the cycle end date', () => {
          it('returns false', () => {
            const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

            expect(result.metadata.isFinal).to.be.false()
          })
        })
      })

      describe('the metadata "purposes" property', () => {
        describe('when a purpose has an "alias"', () => {
          it('returns the alias as part of the purposes data', () => {
            const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

            expect(result.metadata.purposes[0].alias).to.equal('Purpose alias for testing')
          })
        })

        describe('when a purpose does not have an "alias"', () => {
          beforeEach(() => {
            returnRequirement.returnRequirementPurposes[0].alias = null
          })

          it('returns the purposes data without an "alias" property', () => {
            const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

            expect(result.metadata.purposes[0].alias).to.not.exist()
          })
        })
      })
    })
  })
})

function _returnCycle() {
  return {
    id: '6889b98d-964f-4966-b6d6-bf511d6526a1',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    dueDate: new Date('2025-04-28'),
    summer: false,
    submittedInWrls: true
  }
}

function _returnRequirement() {
  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    externalId: '4:16999651',
    id: '4bc1efa7-10af-4958-864e-32acae5c6fa4',
    legacyId: 16999651,
    reportingFrequency: 'day',
    returnVersionId: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
    siteDescription: 'BOREHOLE AT AVALON',
    summer: false,
    twoPartTariff: false,
    upload: false,
    returnVersion: {
      endDate: null,
      id: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
      reason: 'new-licence',
      startDate: new Date('2022-04-01'),
      licence: {
        expiredDate: null,
        id: '3acf7d80-cf74-4e86-8128-13ef687ea091',
        lapsedDate: null,
        licenceRef: '01/25/90/3242',
        revokedDate: null,
        areacode: 'SAAR',
        region: {
          id: 'eb57737f-b309-49c2-9ab6-f701e3a6fd96',
          naldRegionId: 4
        }
      }
    },
    points: [
      {
        description: 'Winter cycle - live licence - live return version - winter return requirement',
        ngr1: 'TG 713 291',
        ngr2: null,
        ngr3: null,
        ngr4: null
      }
    ],
    returnRequirementPurposes: [
      {
        alias: 'Purpose alias for testing',
        id: '06c4c2f2-3dff-4053-bbc8-e6f64cd39623',
        primaryPurpose: {
          description: 'Agriculture',
          id: 'b6bb3b77-cfe8-4f22-8dc9-e92713ca3156',
          legacyId: 'A'
        },
        purpose: {
          description: 'General Farming & Domestic',
          id: '289d1644-5215-4a20-af9e-5664fa9a18c7',
          legacyId: '140'
        },
        secondaryPurpose: {
          description: 'General Agriculture',
          id: '2457bfeb-a120-4b57-802a-46494bd22f82',
          legacyId: 'AGR'
        }
      }
    ]
  }
}
