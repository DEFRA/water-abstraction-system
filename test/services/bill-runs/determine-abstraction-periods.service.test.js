'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AbstractionPeriodLib = require('../../../app/services/bill-runs/determine-abstraction-periods.service.js')

// NOTE: You might find it helpful to refresh your understanding of abstraction periods and what the service is trying
// to fathom when referencing them to the billing and charge periods. See the documentation in the service. Also, a
// a reminder of what in-year and out-year means.
//
// - In-year: If the abstraction period end month is _after_ the start month, for example 01-Jan to 31-May, then we
//            assign the reference period's end year to both the abstraction start and end dates.
// - Out-year: If the abstraction period end month is _before_ the start month, for example 01-Nov to 31-Mar, then we
//             assign the reference period's end year to the end date, and start year to the start date.

describe('Determine Abstraction Periods service', () => {
  let endDay
  let endMonth
  let referencePeriod
  let startDay
  let startMonth

  describe('when the abstraction period is 01-JAN to 31-DEC (in-year)', () => {
    beforeEach(() => {
      startDay = 1
      startMonth = 1
      endDay = 31
      endMonth = 12
    })

    describe('and the reference period is 01-APR-2022 to 31-MAR-2023 (starts first year, ends second year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }
      })

      it('returns the expected abstraction periods', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2022-04-01'),
            endDate: new Date('2022-12-31')
          },
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-03-31')
          }
        ])
      })
    })

    describe('and the reference period is 01-NOV-2022 to 31-DEC-2022 (starts and ends first year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2022-11-01'),
          endDate: new Date('2022-12-31')
        }
      })

      it('returns the expected abstraction period', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2022-11-01'),
            endDate: new Date('2022-12-31')
          }
        ])
      })
    })

    describe('and the reference period is 01-DEC-2022 to 31-JAN-2023 (starts first year, ends second year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2022-12-01'),
          endDate: new Date('2023-01-31')
        }
      })

      it('returns the expected abstraction periods', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2022-12-01'),
            endDate: new Date('2022-12-31')
          },
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-01-31')
          }
        ])
      })
    })

    describe('and the reference period is 01-JAN-2023 to 28-FEB-2023 (starts and ends second year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-02-28')
        }
      })

      it('returns the expected abstraction period', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        ])
      })
    })
  })

  describe('and the abstraction period is 01-JAN to 30-JUN (in-year)', () => {
    beforeEach(() => {
      startDay = 1
      startMonth = 1
      endDay = 30
      endMonth = 6
    })

    describe('and the reference period is 01-NOV-2022 to 31-DEC-2022 (starts and ends first year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2022-11-01'),
          endDate: new Date('2022-12-31')
        }
      })

      it('returns no abstraction periods', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([])
      })
    })

    describe('and the reference period is 01-DEC-2022 to 31-JAN-2023 (starts first year, ends second year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2022-12-01'),
          endDate: new Date('2023-01-31')
        }
      })

      it('returns the expected abstraction period', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-01-31')
          }
        ])
      })
    })

    describe('and the reference period is 01-JAN-2023 to 28-FEB-2023 (starts and ends second year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-02-28')
        }
      })

      it('returns the expected abstraction period', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        ])
      })
    })
  })

  describe('and the abstraction period is 01-OCT to 31-MAR (out-year)', () => {
    beforeEach(() => {
      startDay = 1
      startMonth = 10
      endDay = 31
      endMonth = 3
    })

    describe('and the reference period is 01-NOV-2022 to 31-DEC-2022 (starts and ends first year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2022-11-01'),
          endDate: new Date('2022-12-31')
        }
      })

      it('returns the expected abstraction period', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2022-11-01'),
            endDate: new Date('2022-12-31')
          }
        ])
      })
    })

    describe('and the reference period is 01-DEC-2022 to 31-JAN-2023 (starts first year, ends second year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2022-12-01'),
          endDate: new Date('2023-01-31')
        }
      })

      it('returns the expected abstraction period', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2022-12-01'),
            endDate: new Date('2023-01-31')
          }
        ])
      })
    })

    describe('and the reference period is 01-JAN-2023 to 28-FEB-2023 (starts and ends second year)', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-02-28')
        }
      })

      it('returns the expected abstraction period', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([
          {
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-02-28')
          }
        ])
      })
    })

    describe('and the reference period is 01-AUG-2023 to 30-SEP-2023', () => {
      beforeEach(() => {
        referencePeriod = {
          startDate: new Date('2023-08-01'),
          endDate: new Date('2023-09-30')
        }
      })

      it('returns no abstraction periods', () => {
        const result = AbstractionPeriodLib.determineAbstractionPeriods(
          referencePeriod,
          startDay,
          startMonth,
          endDay,
          endMonth
        )

        expect(result).to.equal([])
      })
    })
  })
})
