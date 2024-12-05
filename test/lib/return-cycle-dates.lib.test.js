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

  describe('cycleDueDate', () => {
    describe('when "summer" is true', () => {
      before(() => {
        summer = true
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          before(() => {
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

        describe('and the current date is before the cycle end', () => {
          before(() => {
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
      })

      describe('and the determination date is in December last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.summer.dueDate.month,
            returnCycleDates.summer.dueDate.day
          )
        })

        it('should return the correct due date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = ReturnCycleDatesLib.cycleDueDate(summer, testDate)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the determination date is in September last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.dueDate.month,
            returnCycleDates.summer.dueDate.day
          )
        })

        it('should return the correct due date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = ReturnCycleDatesLib.cycleDueDate(summer, testDate)

          expect(result).to.equal(expectedDate)
        })
      })
    })

    describe('when "summer" is false', () => {
      before(() => {
        summer = false
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-05-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.allYear.dueDate.month,
              returnCycleDates.allYear.dueDate.day
            )
          })

          it('should return the due date of the next winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.cycleDueDate(summer, testDate)

            expect(result).to.equal(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-03-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.dueDate.month,
              returnCycleDates.allYear.dueDate.day
            )
          })

          it('should return the due date of the current winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.cycleDueDate(summer, testDate)

            expect(result).to.equal(expectedDate)
          })
        })
      })

      describe('and the determination date is in May last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.allYear.dueDate.month,
            returnCycleDates.allYear.dueDate.day
          )
        })

        it('should return the correct due date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = ReturnCycleDatesLib.cycleDueDate(summer, testDate)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the determination date is in March last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.dueDate.month,
            returnCycleDates.allYear.dueDate.day
          )
        })

        it('should return the correct due date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = ReturnCycleDatesLib.cycleDueDate(summer, testDate)

          expect(result).to.equal(expectedDate)
        })
      })
    })
  })

  describe('cycleEndDateByDate', () => {
    describe('when "summer" is true', () => {
      before(() => {
        summer = true
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-12-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.summer.endDate.month,
              returnCycleDates.summer.endDate.day
            )
          })

          it('should return the end date for the next summer cycle', () => {
            const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

            expect(result).to.equal(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-09-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.endDate.month,
              returnCycleDates.summer.endDate.day
            )
          })

          it('should return the end date for the current summer cycle', () => {
            const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

            expect(result).to.equal(expectedDate)
          })
        })
      })

      describe('and the determination date is in December last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.summer.endDate.month,
            returnCycleDates.summer.endDate.day
          )
        })

        it('should return the correct end date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the determination date is in September last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.endDate.month,
            returnCycleDates.summer.endDate.day
          )
        })

        it('should return the correct end date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })
    })

    describe('when "summer" is false', () => {
      before(() => {
        summer = false
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-05-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.allYear.endDate.month,
              returnCycleDates.allYear.endDate.day
            )
          })

          it('should return the end date of the next winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

            expect(result).to.equal(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-02-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.endDate.month,
              returnCycleDates.allYear.endDate.day
            )
          })

          it('should return the end date of the current winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

            expect(result).to.equal(expectedDate)
          })
        })
      })

      describe('and the determination date is in May last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.allYear.endDate.month,
            returnCycleDates.allYear.endDate.day
          )
        })

        it('should return the correct end date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the determination date is in March last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.endDate.month,
            returnCycleDates.allYear.endDate.day
          )
        })

        it('should return the correct end date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = ReturnCycleDatesLib.cycleEndDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })
    })
  })

  describe('cycleStartDateByDate', () => {
    describe('when "summer" is true', () => {
      before(() => {
        summer = true
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-12-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.startDate.month,
              returnCycleDates.summer.startDate.day
            )
          })

          it('should return the start date for the current summer cycle', () => {
            const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

            expect(result).to.equal(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-09-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear() - 1,
              returnCycleDates.summer.startDate.month,
              returnCycleDates.summer.startDate.day
            )
          })

          it('should return the start date for the previous summer cycle', () => {
            const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

            expect(result).to.equal(expectedDate)
          })
        })
      })

      describe('and the determination date is in December last year', () => {
        before(() => {
          summer = true
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.startDate.month,
            returnCycleDates.summer.startDate.day
          )
        })

        it('should return the correct end date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the determination date is in September last year', () => {
        before(() => {
          summer = true
          expectedDate = new Date(
            new Date().getFullYear() - 2,
            returnCycleDates.summer.startDate.month,
            returnCycleDates.summer.startDate.day
          )
        })

        it('should return the correct end date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })
    })

    describe('when "summer" is false', () => {
      before(() => {
        summer = false
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-05-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.startDate.month,
              returnCycleDates.allYear.startDate.day
            )
          })

          it('should return the start date of the current winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

            expect(result).to.equal(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          before(() => {
            testDate = new Date(`${year}-02-01`)
            clock = Sinon.useFakeTimers(testDate)

            expectedDate = new Date(
              new Date().getFullYear() - 1,
              returnCycleDates.allYear.startDate.month,
              returnCycleDates.allYear.startDate.day
            )
          })

          it('should return the start date of the previous winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

            expect(result).to.equal(expectedDate)
          })
        })
      })

      describe('and the determination date is in May last year', () => {
        before(() => {
          summer = false
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.startDate.month,
            returnCycleDates.allYear.startDate.day
          )
        })

        it('should return the correct end date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('and the determination date is in March last year', () => {
        before(() => {
          summer = false
          expectedDate = new Date(
            new Date().getFullYear() - 2,
            returnCycleDates.allYear.startDate.month,
            returnCycleDates.allYear.startDate.day
          )
        })

        it('should return the correct end date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = ReturnCycleDatesLib.cycleStartDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })
    })
  })
})
