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

describe('Return Cycle Dates lib', () => {
  const today = new Date()
  const year = today.getFullYear()

  let clock
  let expectedDate
  let testDate

  afterEach(() => {
    clock.restore()
  })

  describe.only('determineReturnsPeriods', () => {
    let startDate, endDate, dueDate
    describe('and no date is given (defaults to current date)', () => {
      beforeEach(() => {
        testDate = new Date(`${year}-01-01`)
        clock = Sinon.useFakeTimers(testDate)
      })

      describe('"allYear"', () => {
        beforeEach(() => {
          startDate = new Date(
            `${year - 1}-${returnCycleDates.allYear.startDate.month + 1}-${returnCycleDates.allYear.startDate.day}`
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
          startDate = new Date(
            `${year - 1}-${returnCycleDates.summer.startDate.month + 1}-${returnCycleDates.summer.startDate.day}`
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

      describe('"quarterOne"', () => {
        beforeEach(() => {
          startDate = new Date(
            `${year}-${returnCycleDates.quarterOne.startDate.month + 1}-${returnCycleDates.quarterOne.startDate.day}`
          )
          endDate = new Date(
            `${year}-${returnCycleDates.quarterOne.endDate.month + 1}-${returnCycleDates.quarterOne.endDate.day}`
          )
          dueDate = new Date(
            `${year}-${returnCycleDates.quarterOne.dueDate.month + 1}-${returnCycleDates.quarterOne.dueDate.day}`
          )
        })

        it('should return the "quarterOne" period', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterOne).to.equal({
            dueDate,
            endDate,
            name: 'quarterOne',
            startDate
          })
        })
      })

      describe('"quarterTwo"', () => {
        beforeEach(() => {
          startDate = new Date(
            `${year}-${returnCycleDates.quarterTwo.startDate.month + 1}-${returnCycleDates.quarterTwo.startDate.day}`
          )
          endDate = new Date(
            `${year}-${returnCycleDates.quarterTwo.endDate.month + 1}-${returnCycleDates.quarterTwo.endDate.day}`
          )
          dueDate = new Date(
            `${year}-${returnCycleDates.quarterTwo.dueDate.month + 1}-${returnCycleDates.quarterTwo.dueDate.day}`
          )
        })

        it('should return the "quarterTwo" period', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterTwo).to.equal({
            dueDate,
            endDate,
            name: 'quarterTwo',
            startDate
          })
        })
      })

      describe('"quarterThree"', () => {
        beforeEach(() => {
          startDate = new Date(
            `${year}-${returnCycleDates.quarterThree.startDate.month + 1}-${returnCycleDates.quarterThree.startDate.day}`
          )
          endDate = new Date(
            `${year}-${returnCycleDates.quarterThree.endDate.month + 1}-${returnCycleDates.quarterThree.endDate.day}`
          )
          dueDate = new Date(
            `${year}-${returnCycleDates.quarterThree.dueDate.month + 1}-${returnCycleDates.quarterThree.dueDate.day}`
          )
        })

        it('should return the "quarterThree" period', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterThree).to.equal({
            dueDate,
            endDate,
            name: 'quarterThree',
            startDate
          })
        })
      })

      describe('"quarterFour"', () => {
        beforeEach(() => {
          startDate = new Date(
            `${year}-${returnCycleDates.quarterFour.startDate.month + 1}-${returnCycleDates.quarterFour.startDate.day}`
          )
          endDate = new Date(
            `${year}-${returnCycleDates.quarterFour.endDate.month + 1}-${returnCycleDates.quarterFour.endDate.day}`
          )
          dueDate = new Date(
            `${year}-${returnCycleDates.quarterFour.dueDate.month + 1}-${returnCycleDates.quarterFour.dueDate.day}`
          )
        })

        it('should return the "quarterFour" period', () => {
          const result = ReturnPeriodDatesLib.determineReturnsPeriods()

          expect(result.quarterFour).to.equal({
            dueDate,
            endDate,
            name: 'quarterFour',
            startDate
          })
        })
      })
    })
  })
})
