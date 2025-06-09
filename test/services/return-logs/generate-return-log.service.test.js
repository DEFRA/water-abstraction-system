'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { returnCycle, returnRequirement } = require('../../fixtures/return-logs.fixture.js')

// Thing under test
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')

describe('Return Logs - Generate Return Log service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let clock
  let testReturnCycle
  let testReturnRequirement

  beforeEach(() => {
    testReturnCycle = returnCycle()
    testReturnRequirement = returnRequirement()
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))
    })

    it('returns the generated return log data', () => {
      const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

      expect(result).to.equal({
        dueDate: new Date('2026-04-28'),
        endDate: new Date('2026-03-31'),
        id: 'v1:4:01/25/90/3242:16999651:2025-04-01:2026-03-31',
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
        returnCycleId: '6889b98d-964f-4966-b6d6-bf511d6526a9',
        returnReference: '16999651',
        returnsFrequency: 'day',
        source: 'WRLS',
        startDate: new Date('2025-04-01'),
        status: 'due'
      })
    })

    describe('the "endDate" property', () => {
      beforeEach(() => {
        testReturnRequirement.returnVersion.endDate = new Date('2024-08-31')
      })

      // NOTE: We only add one test scenario to highlight the behaviour behind this property. It makes use of the helper
      // `determineEarliestDate()` which already has a suite of tests
      it('returns the earliest end date from the licence, return version, or return cycle', () => {
        const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

        expect(result.endDate).to.equal(new Date('2024-08-31'))
      })
    })

    describe('the "id" property', () => {
      it('returns a unique identifier built from the region code, licence reference, reference, start and end date', () => {
        const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

        expect(result.id).to.equal(`v1:4:01/25/90/3242:16999651:2025-04-01:2026-03-31`)
      })
    })

    describe('the "metadata" property', () => {
      describe('the metadata "isCurrent" property', () => {
        describe('when the return version "reason" is "succession-or-transfer-of-licence"', () => {
          beforeEach(() => {
            testReturnRequirement.returnVersion.reason = 'succession-or-transfer-of-licence'
          })

          it('returns false', () => {
            const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

            expect(result.metadata.isCurrent).to.be.false()
          })
        })

        describe('when the return version "reason" is not "succession-or-transfer-of-licence"', () => {
          it('returns true', () => {
            const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

            expect(result.metadata.isCurrent).to.be.true()
          })
        })
      })

      describe('the metadata "isFinal" property', () => {
        describe('when the calculated end date is less than the cycle end date', () => {
          beforeEach(() => {
            testReturnRequirement.returnVersion.endDate = new Date('2024-05-01')
            testReturnRequirement.summer = true
          })

          it('returns true', () => {
            const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

            expect(result.metadata.isFinal).to.be.true()
          })
        })

        describe('when the calculated end date is greater than or equal to the cycle end date', () => {
          it('returns false', () => {
            const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

            expect(result.metadata.isFinal).to.be.false()
          })
        })
      })

      describe('the metadata "purposes" property', () => {
        describe('when a purpose has an "alias"', () => {
          it('returns the alias as part of the purposes data', () => {
            const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

            expect(result.metadata.purposes[0].alias).to.equal('Purpose alias for testing')
          })
        })

        describe('when a purpose does not have an "alias"', () => {
          beforeEach(() => {
            testReturnRequirement.returnRequirementPurposes[0].alias = null
          })

          it('returns the purposes data without an "alias" property', () => {
            const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

            expect(result.metadata.purposes[0].alias).to.not.exist()
          })
        })
      })

      describe('the metadata "nald" property', () => {
        describe('when the return requirement has an abstraction period set', () => {
          it('returns the "nald" property with period details set to the abstraction period', () => {
            const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

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
            testReturnRequirement.abstractionPeriodEndDay = null
            testReturnRequirement.abstractionPeriodEndMonth = null
            testReturnRequirement.abstractionPeriodStartDay = null
            testReturnRequirement.abstractionPeriodStartMonth = null
          })

          it('returns the "nald" property with period details set to "null"', () => {
            const result = GenerateReturnLogService.go(testReturnRequirement, testReturnCycle)

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
