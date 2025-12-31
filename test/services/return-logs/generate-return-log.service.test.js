'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCyclesFixture = require('../../fixtures/return-cycles.fixture.js')
const ReturnRequirementsFixture = require('../../fixtures/return-requirements.fixture.js')
const { today } = require('../../../app/lib/general.lib.js')

// Thing under test
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')

describe('Return Logs - Generate Return Log service', () => {
  const todaysDate = today()
  const year = todaysDate.getFullYear()

  let clock
  let returnCycle
  let returnRequirement

  beforeEach(() => {
    returnCycle = ReturnCyclesFixture.returnCycle()
    returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
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
        dueDate: null,
        endDate: new Date('2026-03-31'),
        id: `v1:4:${returnRequirement.returnVersion.licence.licenceRef}:16999651:2025-04-01:2026-03-31`,
        licenceRef: returnRequirement.returnVersion.licence.licenceRef,
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
              name: returnRequirement.points[0].description,
              ngr1: returnRequirement.points[0].ngr1,
              ngr2: returnRequirement.points[0].ngr2,
              ngr3: returnRequirement.points[0].ngr3,
              ngr4: returnRequirement.points[0].ngr4
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
        quarterly: true,
        returnCycleId: '6889b98d-964f-4966-b6d6-bf511d6526a9',
        returnReference: '16999651',
        returnRequirementId: returnRequirement.id,
        returnsFrequency: 'day',
        source: 'WRLS',
        startDate: new Date('2025-04-01'),
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
      it('returns a unique identifier built from the region code, licence reference, reference, start and end date', () => {
        const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

        expect(result.id).to.equal(
          `v1:4:${returnRequirement.returnVersion.licence.licenceRef}:16999651:2025-04-01:2026-03-31`
        )
      })
    })

    describe('the "quarterly" property', () => {
      beforeEach(() => {
        returnRequirement.returnVersion.quarterlyReturns = false
      })

      it('returns false when the return versions quarterly-returns flag is false', () => {
        const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

        expect(result.quarterly).to.equal(false)
      })
    })

    describe('the "metadata" property', () => {
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

      describe('the metadata "nald" property', () => {
        describe('when the return requirement has an abstraction period set', () => {
          it('returns the "nald" property with period details set to the abstraction period', () => {
            const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

            expect(result.metadata.nald).to.equal({
              regionCode: 4,
              areaCode: 'SAAR',
              formatId: 16999651,
              periodStartDay: '1',
              periodStartMonth: '4',
              periodEndDay: '31',
              periodEndMonth: '3'
            })
          })
        })

        // NOTE: Some return requirements imported from NALD are missing their abstraction period. It seems this is not
        // a required field!
        describe('when the return requirement does not have abstraction period set', () => {
          beforeEach(() => {
            returnRequirement.abstractionPeriodEndDay = null
            returnRequirement.abstractionPeriodEndMonth = null
            returnRequirement.abstractionPeriodStartDay = null
            returnRequirement.abstractionPeriodStartMonth = null
          })

          it('returns the "nald" property with period details set to "null"', () => {
            const result = GenerateReturnLogService.go(returnRequirement, returnCycle)

            expect(result.metadata.nald).to.equal({
              regionCode: 4,
              areaCode: 'SAAR',
              formatId: 16999651,
              periodStartDay: 'null',
              periodStartMonth: 'null',
              periodEndDay: 'null',
              periodEndMonth: 'null'
            })
          })
        })
      })
    })
  })
})
