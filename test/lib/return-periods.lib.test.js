'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { returnCycleDates } = require('../../app/lib/static-lookups.lib.js')

// Thing under test
const ReturnPeriodDatesLib = require('../../app/lib/return-periods.lib.js')

describe('Return Periods lib', () => {
  const year = 2024
  const nextYear = year + 1
  const lastYear = year - 1

  let clock
  let testDate

  afterEach(() => {
    clock.restore()
  })

  describe.only('determineReturnsPeriods', () => {
    let startDate, endDate, dueDate, dates

    describe('"allYear"', () => {
      beforeEach(() => {
        testDate = new Date(`${year}-01-01`)
        clock = Sinon.useFakeTimers(testDate)
      })
      beforeEach(() => {
        startDate = new Date(
          `${lastYear}-${returnCycleDates.allYear.startDate.month + 1}-${returnCycleDates.allYear.startDate.day}`
        )
        endDate = new Date(
          `${year}-${returnCycleDates.allYear.endDate.month + 1}-${returnCycleDates.allYear.endDate.day}`
        )
        dueDate = new Date(
          `${year}-${returnCycleDates.allYear.dueDate.month + 1}-${returnCycleDates.allYear.dueDate.day}`
        )
      })

      it('should return the "allYear" period', () => {
        const result = ReturnPeriodDatesLib.determineReturnsPeriods()

        expect(result.allYear).to.equal({
          dueDate,
          endDate,
          name: 'allYear',
          startDate
        })
      })
    })

    describe('"summer"', () => {
      beforeEach(() => {
        testDate = new Date(`${year}-01-01`)
        clock = Sinon.useFakeTimers(testDate)
      })

      beforeEach(() => {
        startDate = new Date(
          `${lastYear}-${returnCycleDates.summer.startDate.month + 1}-${returnCycleDates.summer.startDate.day}`
        )
        endDate = new Date(
          `${year}-${returnCycleDates.summer.endDate.month + 1}-${returnCycleDates.summer.endDate.day}`
        )
        dueDate = new Date(
          `${year}-${returnCycleDates.summer.dueDate.month + 1}-${returnCycleDates.summer.dueDate.day}`
        )
      })

      it('should return the "summer" period', () => {
        const result = ReturnPeriodDatesLib.determineReturnsPeriods()

        expect(result.summer).to.equal({
          dueDate,
          endDate,
          name: 'summer',
          startDate
        })
      })
    })

    describe('"quarterOne" - Starts 1 January - 31 March (Due date 28 April) ', () => {
      describe('when it is currently "quarterOne"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterOne, year)

          testDate = new Date(`${year}-01-01`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterOne" period', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterOne).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterOne',
            startDate: dates.startDate
          })
        })
      })

      describe('when it is before "quarterOne" (in the previous year)', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterOne, nextYear)

          testDate = new Date(`${year}-12-31`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterOne" period in the upcoming year', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterOne).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterOne',
            startDate: dates.startDate
          })
        })
      })

      describe('when it is after "quarterOne"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterOne, nextYear)

          testDate = new Date(`${year}-04-30`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterOne" period for next year', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterOne).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterOne',
            startDate: dates.startDate
          })
        })
      })
    })

    describe('"quarterTwo" - Starts 1 April - 30 June (Due date 28 July) ', () => {
      describe('when it is currently "quarterTwo"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterTwo, year)

          testDate = new Date(`${year}-04-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterTwo" period', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterTwo).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterTwo',
            startDate: dates.startDate
          })
        })
      })

      describe('when it is before "quarterTwo" (in the previous year)', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterTwo, nextYear)

          testDate = new Date(`${year}-12-31`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterTwo" period in the upcoming year', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterTwo).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterTwo',
            startDate: dates.startDate
          })
        })
      })

      describe('when it is after "quarterTwo"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterTwo, nextYear)

          testDate = new Date(`${year}-07-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterTwo" period for next year', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterTwo).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterTwo',
            startDate: dates.startDate
          })
        })
      })
    })

    describe('"quarterThree" - Starts 1 July - 30 September (Due date 28 October) ', () => {
      describe('when it is currently "quarterThree"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterThree, year)

          testDate = new Date(`${year}-07-01`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterThree" period', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterThree).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterThree',
            startDate: dates.startDate
          })
        })
      })

      describe('when it is before "quarterThree" (in the previous year)', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterThree, nextYear)

          testDate = new Date(`${year}-12-31`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterThree" period in the upcoming year', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterThree).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterThree',
            startDate: dates.startDate
          })
        })
      })

      describe('when it is after "quarterThree"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterThree, nextYear)

          testDate = new Date(`${year}-10-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterThree" period for next year', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterThree).to.equal({
            dueDate: dates.dueDate,
            endDate: dates.endDate,
            name: 'quarterThree',
            startDate: dates.startDate
          })
        })
      })
    })

    describe('"quarterFour" - Starts 1 October - 31 December (Due date 28 January) ', () => {
      let dueDateNextYear
      describe('when it is currently "quarterFour"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterFour, year)

          dueDateNextYear = new Date(dates.dueDate)
          dueDateNextYear.setFullYear(dueDateNextYear.getFullYear() + 1)

          testDate = new Date(`${year}-10-01`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterFour" period', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterFour).to.equal({
            dueDate: dueDateNextYear,
            endDate: dates.endDate,
            name: 'quarterFour',
            startDate: dates.startDate
          })
        })
      })

      describe('when it is before "quarterFour" (in the previous year)', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterFour, year)

          dueDateNextYear = new Date(dates.dueDate)
          dueDateNextYear.setFullYear(dueDateNextYear.getFullYear() + 1)

          testDate = new Date(`${year}-12-31`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterFour" period in the upcoming year', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterFour).to.equal({
            dueDate: dueDateNextYear,
            endDate: dates.endDate,
            name: 'quarterFour',
            startDate: dates.startDate
          })
        })
      })

      describe('when it is after "quarterFour"', () => {
        beforeEach(() => {
          dates = _getPeriodDates(returnCycleDates.quarterFour, nextYear)

          dueDateNextYear = new Date(dates.dueDate)
          dueDateNextYear.setFullYear(dueDateNextYear.getFullYear() + 1)

          testDate = new Date(`${nextYear}-01-29`)
          clock = Sinon.useFakeTimers(testDate)
        })

        it('should return the "quarterFour" period for next year', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterFour).to.equal({
            dueDate: dueDateNextYear,
            endDate: dates.endDate,
            name: 'quarterFour',
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
