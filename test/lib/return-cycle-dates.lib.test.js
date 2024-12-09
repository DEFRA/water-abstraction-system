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

  describe('periods', () => {
    // Temp
    beforeEach(() => {
      clock = Sinon.useFakeTimers()
    })
    describe('work out periods', () => {
      it('should return the calculated return periods', () => {
        const result = ReturnCycleDatesLib.periods(new Date(`2024-10-29`))
        expect(result).to.equal({
          summerAllYear: {
            dueDate: new Date('2024-11-28'),
            endDate: new Date('2024-10-31'),
            startDate: new Date('2023-11-01'),
            value: 'summerAllYear'
          },
          summerQuarterOne: {
            dueDate: new Date('2024-11-29'),
            endDate: new Date('2025-01-28'),
            startDate: new Date('2024-11-29'),
            value: 'summerQuarterOne'
          }
        })
      })
    })
  })

  describe.only('periods current', () => {
    let date
    // Temp
    beforeEach(() => {
      clock = Sinon.useFakeTimers()
    })

    describe('AC 1', () => {
      describe('work out periods - 29 January to 28 April', () => {
        beforeEach(() => {
          date = new Date(`2024-02-02`)
        })

        it('should return current period', () => {
          const result = ReturnCycleDatesLib.currentReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2024-04-28'),
            endDate: new Date('2024-03-31'),
            startDate: new Date('2024-01-01'),
            name: 'winterQuarterOne'
          })
        })

        it('should return next period', () => {
          const result = ReturnCycleDatesLib.nextReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2024-04-28'),
            endDate: new Date('2024-03-31'),
            startDate: new Date('2024-04-01'),
            name: 'winterQuarterFour'
          })
        })
      })
    })

    describe('AC 2', () => {
      describe('work out periods - 29 April - 28 July', () => {
        beforeEach(() => {
          date = new Date(`2024-07-07`)
        })

        it('should return current period', () => {
          const result = ReturnCycleDatesLib.currentReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2024-07-28'),
            endDate: new Date('2024-06-30'),
            startDate: new Date('2024-04-01'),
            name: 'winterQuarterOne'
          })
        })

        it('should return next period', () => {
          const result = ReturnCycleDatesLib.nextReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2025-10-28'),
            endDate: new Date('2024-09-30'),
            startDate: new Date('2024-06-01'),
            name: 'winterQuarterThree'
          })
        })
      })
    })

    describe('AC 3', () => {
      describe('work out periods - due 29 July - 28 October', () => {
        beforeEach(() => {
          date = new Date(`2024-07-29`)
        })

        it('should return current period', () => {
          const result = ReturnCycleDatesLib.currentReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2024-10-28'),
            endDate: new Date('2024-09-30'),
            startDate: new Date('2024-06-01'),
            name: 'winterQuarterTwo'
          })
        })

        it('should return next period', () => {
          const result = ReturnCycleDatesLib.nextReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2024-11-28'),
            endDate: new Date('2024-10-31'),
            startDate: new Date('2023-11-01'),
            name: 'summerAllYear'
          })
        })
      })
    })

    describe('AC 4', () => {
      describe('work out periods - 29th October - 28th November', () => {
        beforeEach(() => {
          date = new Date(`2024-11-20`)
        })
        it('should return current period', () => {
          const result = ReturnCycleDatesLib.currentReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2024-11-28'),
            endDate: new Date('2024-10-31'),
            startDate: new Date('2023-11-01'),
            name: 'summerAllYear'
          })
        })

        it('should return next period', () => {
          const result = ReturnCycleDatesLib.nextReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2025-01-28'),
            endDate: new Date('2024-12-31'),
            startDate: new Date('2024-10-01'),
            name: 'winterQuarterThree'
          })
        })
      })
    })

    describe.only('AC 5 & 6', () => {
      describe('work out periods - 29 November - 31 December', () => {
        beforeEach(() => {
          date = new Date(`2024-11-25`)
        })
        it('should return current period', () => {
          const result = ReturnCycleDatesLib.currentReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2025-01-28'),
            endDate: new Date('2024-12-31'),
            startDate: new Date('2024-10-01'),
            name: 'summerAllYear'
          })
        })

        it('should return next period', () => {
          const result = ReturnCycleDatesLib.nextReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2025-04-28'),
            endDate: new Date('2025-03-31'),
            startDate: new Date('2025-01-01'),
            name: 'winterQuarterThree'
          })
        })
      })

      describe('work out periods - 1 January - 28 January', () => {
        beforeEach(() => {
          date = new Date(`2024-01-25`)
        })
        it('should return current period', () => {
          const result = ReturnCycleDatesLib.currentReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2024-01-28'),
            endDate: new Date('2023-12-31'),
            startDate: new Date('2023-10-01'),
            name: 'summerAllYear'
          })
        })

        it('should return next period', () => {
          const result = ReturnCycleDatesLib.nextReturnPeriod(date)
          expect(result).to.equal({
            dueDate: new Date('2025-04-28'),
            endDate: new Date('2024-03-31'),
            startDate: new Date('2024-01-01'),
            name: 'winterQuarterThree'
          })
        })
      })
    })
  })
})

//All year (Winter)
// Name       | Start Date  | End Date  | Due Date  |
// Full year    1/04/25       31/03/26    28/04/26
// Q1           1/04/25       30/06/25    28/07/25
// Q2           1/07/25       31/09/25    28/10/25
// Q3           1/10/25       31/12/25    28/01/26
// Q4           1/01/26       31/03/26    28/04/26
//
// Summer (Annual)
// Name       | Start Date  | End Date  | Due Date  |
// Full year    1/11/26       31/10/27    28/11/27
// Q1           1/11/26       31/01/26    28/02/26
// Q2           1/02/27       30/04/27    28/05/27
// Q3           1/05/27       31/07/27    28/08/27
// Q4           1/08/27       31/10/27    28/11/27
