'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { returnPeriodDates } = require('../../app/lib/static-lookups.lib.js')

// Thing under test
const ReturnPeriodLib = require('../../app/lib/return-periods.lib.js')

describe('Return Period lib', () => {
  const year = 2024
  const nextYear = year + 1
  const lastYear = year - 1

  let clock
  let testDate
  let dates

  beforeEach(() => {
    clock = Sinon.useFakeTimers(new Date(`${year}-01-01`))
  })

  afterEach(() => {
    clock.restore()
  })

  describe('determineReturnsPeriods', () => {
    describe('"allYear"', () => {
      let startDate, endDate, dueDate

      beforeEach(() => {
        startDate = new Date(
          `${lastYear}-${returnPeriodDates.allYear.startDate.month + 1}-${returnPeriodDates.allYear.startDate.day}`
        )
        endDate = new Date(
          `${year}-${returnPeriodDates.allYear.endDate.month + 1}-${returnPeriodDates.allYear.endDate.day}`
        )
        dueDate = new Date(
          `${year}-${returnPeriodDates.allYear.dueDate.month + 1}-${returnPeriodDates.allYear.dueDate.day}`
        )
      })

      it('should return the "allYear" period', () => {
        const result = ReturnPeriodLib.determineReturnsPeriods()

        expect(result.allYear).to.equal({
          dueDate,
          endDate,
          startDate
        })
      })
    })

    describe('"summer"', () => {
      let startDate, endDate, dueDate

      beforeEach(() => {
        startDate = new Date(
          `${lastYear}-${returnPeriodDates.summer.startDate.month + 1}-${returnPeriodDates.summer.startDate.day}`
        )
        endDate = new Date(
          `${year}-${returnPeriodDates.summer.endDate.month + 1}-${returnPeriodDates.summer.endDate.day}`
        )
        dueDate = new Date(
          `${year}-${returnPeriodDates.summer.dueDate.month + 1}-${returnPeriodDates.summer.dueDate.day}`
        )
      })

      it('should return the "summer" period', () => {
        const result = ReturnPeriodLib.determineReturnsPeriods()

        expect(result.summer).to.equal({
          dueDate,
          endDate,
          startDate
        })
      })
    })

    describe('"quarterOne": 1 January - 31 March (Due date 28 April) ', () => {
      describe('when it is currently "quarterOne"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterOne, year)

          testDate = new Date(`${year}-01-01`)
        })

        it('should return the "quarterOne" period', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterOne).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })

      describe('when it is before "quarterOne" (in the previous year)', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterOne, nextYear)

          testDate = new Date(`${year}-12-31`)
        })

        it('should return the "quarterOne" period in the upcoming year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterOne).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })

      describe('when it is after "quarterOne"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterOne, nextYear)

          testDate = new Date(`${year}-04-30`)
        })

        it('should return the "quarterOne" period for next year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterOne).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })
    })

    describe('"quarterTwo": 1 April - 30 June (Due date 28 July) ', () => {
      describe('when it is currently "quarterTwo"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterTwo, year)

          testDate = new Date(`${year}-04-29`)
        })

        it('should return the "quarterTwo" period', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterTwo).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })

      describe('when it is before "quarterTwo" (in the previous year)', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterTwo, nextYear)

          testDate = new Date(`${year}-12-31`)
        })

        it('should return the "quarterTwo" period in the upcoming year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterTwo).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })

      describe('when it is after "quarterTwo"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterTwo, nextYear)

          testDate = new Date(`${year}-07-29`)
        })

        it('should return the "quarterTwo" period for next year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterTwo).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })
    })

    describe('"quarterThree": 1 July - 30 September (Due date 28 October) ', () => {
      describe('when it is currently "quarterThree"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterThree, year)

          testDate = new Date(`${year}-07-01`)
        })

        it('should return the "quarterThree" period', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterThree).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })

      describe('when it is before "quarterThree" (in the previous year)', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterThree, nextYear)

          testDate = new Date(`${year}-12-31`)
        })

        it('should return the "quarterThree" period in the upcoming year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterThree).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })

      describe('when it is after "quarterThree"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterThree, nextYear)

          testDate = new Date(`${year}-10-29`)
        })

        it('should return the "quarterThree" period for next year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterThree).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })
    })

    describe('"quarterFour": 1 October - 31 December (Due date 28 January) ', () => {
      let dueDateNextYear
      describe('when it is currently "quarterFour" (Between October and December)', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterFour, year)

          dueDateNextYear = new Date(dates.dueDate)
          dueDateNextYear.setFullYear(dueDateNextYear.getFullYear() + 1)

          testDate = new Date(`${year}-10-01`)
        })

        it('should return the "quarterFour" period', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterFour).to.equal({
            dueDate: dueDateNextYear,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })

      describe('when it is currently "quarterFour" (In January before the Due date)', () => {
        beforeEach(() => {
          testDate = new Date(`${year}-01-01`)
        })

        it('should return the "quarterFour" period - with the Due date in the current year and the start and end in the previous year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          dates = _getPeriodDates(returnPeriodDates.quarterFour, year)

          const startDate = new Date(dates.startDate)
          startDate.setFullYear(startDate.getFullYear() - 1)

          const endDate = new Date(dates.endDate)
          endDate.setFullYear(endDate.getFullYear() - 1)

          expect(result.quarterFour).to.equal({
            dueDate: dates.dueDate,
            endDate,
            startDate
          })
        })
      })

      describe('when it is before "quarterFour"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterFour, year)

          dueDateNextYear = new Date(dates.dueDate)
          dueDateNextYear.setFullYear(dueDateNextYear.getFullYear() + 1)

          testDate = new Date(`${year}-08-01`)
        })

        it('should return the "quarterFour" period in the upcoming year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterFour).to.equal({
            dueDate: dueDateNextYear,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })

      describe('when it is after "quarterFour"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnPeriodDates.quarterFour, nextYear)

          dueDateNextYear = new Date(dates.dueDate)
          dueDateNextYear.setFullYear(dueDateNextYear.getFullYear() + 1)

          testDate = new Date(`${nextYear}-01-29`)
        })

        it('should return the "quarterFour" period for next year', () => {
          const result = ReturnPeriodLib.determineReturnsPeriods(testDate)

          expect(result.quarterFour).to.equal({
            dueDate: dueDateNextYear,
            endDate: dates.endDate,
            startDate: dates.startDate
          })
        })
      })
    })
  })
})

function _getPeriodDates(period, year) {
  return {
    startDate: new Date(`${year}-${period.startDate.month + 1}-${period.startDate.day}`),
    endDate: new Date(`${year}-${period.endDate.month + 1}-${period.endDate.day}`),
    dueDate: new Date(`${year}-${period.dueDate.month + 1}-${period.dueDate.day}`)
  }
}
