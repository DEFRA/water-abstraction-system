'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { determineCurrentFinancialYear } = require('../../../app/lib/general.lib.js')

// Thing under test
const DetermineBillingPeriodsService = require('../../../app/services/bill-runs/determine-billing-periods.service.js')

describe('Determine Billing Periods service', () => {
  const currentFinancialYear = determineCurrentFinancialYear()

  let billRunType
  let clock
  let expectedResult
  let financialYearEnding
  let testDate

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the bill run type is "annual"', () => {
    beforeEach(() => {
      billRunType = 'annual'
    })

    describe('and no financial year ending is provided', () => {
      it('returns a single billing period for the current financial year', () => {
        const result = DetermineBillingPeriodsService.go(billRunType)

        expect(result).to.have.length(1)
        expect(result[0]).to.equal(currentFinancialYear)
      })
    })

    describe('and the financial year ending "2023" is provided', () => {
      beforeEach(() => {
        financialYearEnding = 2023

        expectedResult = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }
      })

      it('returns a single billing period for that financial year', () => {
        const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

        expect(result).to.have.length(1)
        expect(result[0]).to.equal(expectedResult)
      })
    })
  })

  describe('when the bill run type is "two_part_tariff"', () => {
    beforeEach(() => {
      billRunType = 'two_part_tariff'
    })

    describe('and no financial year ending is provided', () => {
      it('returns a single billing period for the current financial year', () => {
        const result = DetermineBillingPeriodsService.go(billRunType)

        expect(result).to.have.length(1)
        expect(result[0]).to.equal(currentFinancialYear)
      })
    })

    describe('and the financial year ending "2023" is provided', () => {
      beforeEach(() => {
        financialYearEnding = 2023

        expectedResult = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }
      })

      it('returns a single billing period for that financial year', () => {
        const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

        expect(result).to.have.length(1)
        expect(result[0]).to.equal(expectedResult)
      })
    })
  })

  describe('when the bill run type is "supplementary"', () => {
    beforeEach(() => {
      billRunType = 'supplementary'
    })

    afterEach(() => {
      clock.restore()
    })

    describe("and today's date is 2022-05-01 (in start year of financial year)", () => {
      beforeEach(() => {
        testDate = new Date('2022-05-01')
        clock = Sinon.useFakeTimers(testDate)

        expectedResult = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }
      })

      describe('and no financial year ending is provided', () => {
        it('returns a single billing period for the "current" financial year', () => {
          const result = DetermineBillingPeriodsService.go(billRunType)

          expect(result).to.have.length(1)
          expect(result[0]).to.equal(expectedResult)
        })
      })

      // NOTE: This scenario would never happen, i.e. that we'd get a request to generate an SROC supplementary for a
      // PRESROC financial year. But it demonstrates the service will only generate billing periods that start in the
      // first year of SROC
      describe('and the financial year ending "2021" is provided', () => {
        beforeEach(() => {
          financialYearEnding = 2021
        })

        it('returns no billing periods', () => {
          const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

          expect(result).to.be.empty()
        })
      })

      describe('and the financial year ending "2023" is provided', () => {
        beforeEach(() => {
          financialYearEnding = 2023

          expectedResult = {
            startDate: new Date('2022-04-01'),
            endDate: new Date('2023-03-31')
          }
        })

        it('returns a single billing period for that financial year', () => {
          const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

          expect(result).to.have.length(1)
          expect(result[0]).to.equal(expectedResult)
        })
      })
    })

    describe("and today's date is 2023-02-01 (in end year of financial year)", () => {
      beforeEach(() => {
        testDate = new Date('2023-02-01')
        clock = Sinon.useFakeTimers(testDate)

        expectedResult = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }
      })

      describe('and no financial year ending is provided', () => {
        it('returns a single billing period for the "current" financial year', () => {
          const result = DetermineBillingPeriodsService.go(billRunType)

          expect(result).to.have.length(1)
          expect(result[0]).to.equal(expectedResult)
        })
      })

      // NOTE: This scenario would never happen, i.e. that we'd get a request to generate an SROC supplementary for a
      // PRESROC financial year. But it demonstrates the service will only generate billing periods that start in the
      // first year of SROC
      describe('and the financial year ending "2021" is provided', () => {
        beforeEach(() => {
          financialYearEnding = 2021
        })

        it('returns no billing periods', () => {
          const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

          expect(result).to.be.empty()
        })
      })

      describe('and the financial year ending "2023" is provided', () => {
        beforeEach(() => {
          financialYearEnding = 2023

          expectedResult = {
            startDate: new Date('2022-04-01'),
            endDate: new Date('2023-03-31')
          }
        })

        it('returns a single billing period for that financial year', () => {
          const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

          expect(result).to.have.length(1)
          expect(result[0]).to.equal(expectedResult)
        })
      })
    })

    describe("and today's date is 2030-05-01 (more than 5 years from first SROC year end)", () => {
      beforeEach(() => {
        testDate = new Date('2030-05-01')
        clock = Sinon.useFakeTimers(testDate)

        expectedResult = [
          {
            startDate: new Date('2030-04-01'),
            endDate: new Date('2031-03-31')
          },
          {
            startDate: new Date('2029-04-01'),
            endDate: new Date('2030-03-31')
          },
          {
            startDate: new Date('2028-04-01'),
            endDate: new Date('2029-03-31')
          },
          {
            startDate: new Date('2027-04-01'),
            endDate: new Date('2028-03-31')
          },
          {
            startDate: new Date('2026-04-01'),
            endDate: new Date('2027-03-31')
          },
          {
            startDate: new Date('2025-04-01'),
            endDate: new Date('2026-03-31')
          }
        ]
      })

      describe('and no financial year ending is provided', () => {
        it('returns 6 billing periods starting with the "current" financial year and working back', () => {
          const result = DetermineBillingPeriodsService.go(billRunType)

          expect(result).to.have.length(6)
          expect(result).to.equal(expectedResult)
        })
      })

      describe('and the financial year ending "2026" is provided', () => {
        beforeEach(() => {
          financialYearEnding = 2026

          expectedResult = [
            {
              startDate: new Date('2025-04-01'),
              endDate: new Date('2026-03-31')
            },
            {
              startDate: new Date('2024-04-01'),
              endDate: new Date('2025-03-31')
            },
            {
              startDate: new Date('2023-04-01'),
              endDate: new Date('2024-03-31')
            },
            {
              startDate: new Date('2022-04-01'),
              endDate: new Date('2023-03-31')
            }
          ]
        })

        it('returns 4 billing periods starting with that financial year and working back to last SROC year', () => {
          const result = DetermineBillingPeriodsService.go(billRunType, financialYearEnding)

          expect(result).to.have.length(4)
          expect(result).to.equal(expectedResult)
        })
      })
    })
  })
})
