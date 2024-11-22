'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { returnCycleDates } = require('../../app/lib/static-lookups.lib.js')

// Thing under test
const ReturnCycleDatesLib = require('../../app/lib/return-cycle-dates.lib.js')

describe('Return Cycle Dates lib', () => {
  const today = new Date()
  const year = today.getFullYear()

  let clock
  let expectedDate
  let summer
  let testDate

  afterEach(() => {
    clock.restore()
  })

  describe('cycleDueDate', () => {
    describe('when the requested cycle is "summer" and the current date is after the cycle end', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-12-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() + 1,
          returnCycleDates.summer.dueDate.month,
          returnCycleDates.summer.dueDate.day
        )
      })

      it('should return the due date for next years summer cycle', () => {
        const result = ReturnCycleDatesLib.cycleDueDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "summer" and the current date is before the cycle end', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-09-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.summer.dueDate.month,
          returnCycleDates.summer.dueDate.day
        )
      })

      it('should return the due date for this years summer cycle', () => {
        const result = ReturnCycleDatesLib.cycleDueDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is after the cycle end', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-05-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() + 1,
          returnCycleDates.allYear.dueDate.month,
          returnCycleDates.allYear.dueDate.day
        )
      })

      it('should return the due date of the next winter and all year cycle', () => {
        const result = ReturnCycleDatesLib.cycleDueDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is after the cycle end', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-03-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.allYear.dueDate.month,
          returnCycleDates.allYear.dueDate.day
        )
      })

      it('should return the due date of the current winter and all year cycle', () => {
        const result = ReturnCycleDatesLib.cycleDueDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleDueDateAsISO', () => {
    describe('when the requested cycle is "summer" and the current date is after the cycle end', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-12-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() + 1,
          returnCycleDates.summer.dueDate.month,
          returnCycleDates.summer.dueDate.day
        )
          .toISOString()
          .split('T')[0]

        it('should return the due date of next years summer cycle formatted as YYYY-MM-DD', () => {
          const result = ReturnCycleDatesLib.cycleDueDateAsISO(summer)

          expect(result).to.equal(expectedDate)
        })
      })
    })

    describe('when the requested cycle is "summer" and the current date is before the cycle end', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-09-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.summer.dueDate.month,
          returnCycleDates.summer.dueDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the due date for this years summer cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleDueDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is after the cycle end', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-05-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() + 1,
          returnCycleDates.allYear.dueDate.month,
          returnCycleDates.allYear.dueDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the due date of the next winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleDueDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is after the cycle end', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-03-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.allYear.dueDate.month,
          returnCycleDates.allYear.dueDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the due date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleDueDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleEndDate', () => {
    describe('when the requested cycle is "summer" and the current date is after the cycle end', () => {
      beforeEach(() => {
        summer = true
        testDate = new Date(`${year}-12-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() + 1,
          returnCycleDates.summer.endDate.month,
          returnCycleDates.summer.endDate.day
        )
      })

      it('should return the end date for the next summer cycle', () => {
        const result = ReturnCycleDatesLib.cycleEndDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "summer" and the current date is before the cycle end', () => {
      beforeEach(() => {
        summer = true
        testDate = new Date(`${year}-09-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.summer.endDate.month,
          returnCycleDates.summer.endDate.day
        )
      })

      it('should return the end date for the current summer cycle', () => {
        const result = ReturnCycleDatesLib.cycleEndDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is after the cycle end', () => {
      beforeEach(() => {
        summer = false
        testDate = new Date(`${year}-05-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() + 1,
          returnCycleDates.allYear.endDate.month,
          returnCycleDates.allYear.endDate.day
        )
      })

      it('should return the end date of the next winter and all year cycle', () => {
        const result = ReturnCycleDatesLib.cycleEndDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is before the cycle end', () => {
      beforeEach(() => {
        summer = false
        testDate = new Date(`${year}-02-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.allYear.endDate.month,
          returnCycleDates.allYear.endDate.day
        )
      })

      it('should return the end date of the current winter and all year cycle', () => {
        const result = ReturnCycleDatesLib.cycleEndDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleEndDateAsISO', () => {
    describe('when the requested cycle is "summer" and the current date is after the cycle end', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-12-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() + 1,
          returnCycleDates.summer.endDate.month,
          returnCycleDates.summer.endDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the end date for the next summer cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleEndDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "summer" and the current date is before the cycle end', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-09-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.summer.endDate.month,
          returnCycleDates.summer.endDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the end date for the current summer cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleEndDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is after the cycle end', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-05-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() + 1,
          returnCycleDates.allYear.endDate.month,
          returnCycleDates.allYear.endDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the end date of the next winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleEndDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is before the cycle end', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-02-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.allYear.endDate.month,
          returnCycleDates.allYear.endDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the end date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleEndDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleStartDate', () => {
    describe('when the requested cycle is "summer" and the current date is after the cycle start', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-12-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.summer.startDate.month,
          returnCycleDates.summer.startDate.day
        )
      })

      it('should return the start date for the current summer cycle', () => {
        const result = ReturnCycleDatesLib.cycleStartDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "summer" and the current date is before the cycle start', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-09-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.summer.startDate.month,
          returnCycleDates.summer.startDate.day
        )
      })

      it('should return the start date for the previous summer cycle', () => {
        const result = ReturnCycleDatesLib.cycleStartDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is after the cycle start', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-05-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.allYear.startDate.month,
          returnCycleDates.allYear.startDate.day
        )
      })

      it('should return the start date of the current winter and all year cycle', () => {
        const result = ReturnCycleDatesLib.cycleStartDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is before the cycle start', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-02-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.allYear.startDate.month,
          returnCycleDates.allYear.startDate.day
        )
      })

      it('should return the start date of the previous winter and all year cycle', () => {
        const result = ReturnCycleDatesLib.cycleStartDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleStartDateAsISO', () => {
    describe('when the requested cycle is "summer" and the current date is after the cycle start', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-12-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.summer.startDate.month,
          returnCycleDates.summer.startDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the start date for the current summer cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleStartDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "summer" and the current date is before the cycle start', () => {
      before(() => {
        summer = true
        testDate = new Date(`${year}-09-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.summer.startDate.month,
          returnCycleDates.summer.startDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the start date for the previous summer cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleStartDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is after the cycle start', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-05-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.allYear.startDate.month,
          returnCycleDates.allYear.startDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the start date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleStartDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year" and the current date is before the cycle start', () => {
      before(() => {
        summer = false
        testDate = new Date(`${year}-02-01`)
        clock = Sinon.useFakeTimers(testDate)

        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.allYear.startDate.month,
          returnCycleDates.allYear.startDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the start date of the previous winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = ReturnCycleDatesLib.cycleStartDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleDueDateByDate', () => {
    describe('when summer is true and given a date in december last year', () => {
      before(() => {
        summer = true
        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.summer.dueDate.month,
          returnCycleDates.summer.dueDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct due date for the summer cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-12-01`)
        const result = ReturnCycleDatesLib.cycleDueDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is true and given a date in september last year', () => {
      before(() => {
        summer = true
        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.summer.dueDate.month,
          returnCycleDates.summer.dueDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct due date for the summer cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-09-01`)
        const result = ReturnCycleDatesLib.cycleDueDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is false and given a date in may last year', () => {
      before(() => {
        summer = false
        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.allYear.dueDate.month,
          returnCycleDates.allYear.dueDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct due date for the all year cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-05-01`)
        const result = ReturnCycleDatesLib.cycleDueDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is false and given a date in march last year', () => {
      before(() => {
        summer = false
        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.allYear.dueDate.month,
          returnCycleDates.allYear.dueDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct due date for the all year cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-03-01`)
        const result = ReturnCycleDatesLib.cycleDueDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleEndDateByDate', () => {
    describe('when summer is true and given a date in december last year', () => {
      before(() => {
        summer = true
        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.summer.endDate.month,
          returnCycleDates.summer.endDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct end date for the summer cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-12-01`)
        const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is true and given a date in september last year', () => {
      before(() => {
        summer = true
        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.summer.endDate.month,
          returnCycleDates.summer.endDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct end date for the summer cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-09-01`)
        const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is false and given a date in may last year', () => {
      before(() => {
        summer = false
        expectedDate = new Date(
          new Date().getFullYear(),
          returnCycleDates.allYear.endDate.month,
          returnCycleDates.allYear.endDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct end date for the all year cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-05-01`)
        const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is false and given a date in march last year', () => {
      before(() => {
        summer = false
        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.allYear.endDate.month,
          returnCycleDates.allYear.endDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct end date for the all year cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-03-01`)
        const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleStartDateByDate', () => {
    describe('when summer is true and given a date in december last year', () => {
      before(() => {
        summer = true
        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.summer.startDate.month,
          returnCycleDates.summer.startDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct end date for the summer cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-12-01`)
        const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is true and given a date in september last year', () => {
      before(() => {
        summer = true
        expectedDate = new Date(
          new Date().getFullYear() - 2,
          returnCycleDates.summer.startDate.month,
          returnCycleDates.summer.startDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct end date for the summer cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-09-01`)
        const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is false and given a date in may last year', () => {
      before(() => {
        summer = false
        expectedDate = new Date(
          new Date().getFullYear() - 1,
          returnCycleDates.allYear.startDate.month,
          returnCycleDates.allYear.startDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct end date for the all year cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-05-01`)
        const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when summer is false and given a date in march last year', () => {
      before(() => {
        summer = false
        expectedDate = new Date(
          new Date().getFullYear() - 2,
          returnCycleDates.allYear.startDate.month,
          returnCycleDates.allYear.startDate.day
        )
          .toISOString()
          .split('T')[0]
      })

      it('should return the correct end date for the all year cycle formatted as YYYY-MM-DD', () => {
        const testDate = new Date(`${year - 1}-03-01`)
        const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })
})
