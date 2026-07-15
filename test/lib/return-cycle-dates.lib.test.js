// Test helpers
import { returnCycleDates } from '../../app/lib/static-lookups.lib.js'
import { today } from '../../app/lib/general.lib.js'

// Thing under test
import * as ReturnCycleDatesLib from '../../app/lib/return-cycle-dates.lib.js'

describe('Return Cycle Dates lib', () => {
  const todaysDate = today()
  const year = todaysDate.getFullYear()

  let expectedDate
  let summer
  let testDate

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('determineCycleDueDate', () => {
    describe('when "summer" is true', () => {
      beforeAll(() => {
        summer = true
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-12-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.summer.dueDate.month,
              returnCycleDates.summer.dueDate.day
            )
          })

          it('should return the due date for next years summer cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleDueDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-09-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.dueDate.month,
              returnCycleDates.summer.dueDate.day
            )
          })

          it('should return the due date for this years summer cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleDueDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })
      })

      describe('and the determination date is in December last year', () => {
        beforeAll(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.summer.dueDate.month,
            returnCycleDates.summer.dueDate.day
          )
        })

        it('should return the correct due date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = ReturnCycleDatesLib.determineCycleDueDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })

      describe('and the determination date is in September last year', () => {
        beforeAll(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.dueDate.month,
            returnCycleDates.summer.dueDate.day
          )
        })

        it('should return the correct due date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = ReturnCycleDatesLib.determineCycleDueDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })
    })

    describe('when "summer" is false', () => {
      beforeAll(() => {
        summer = false
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-05-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.allYear.dueDate.month,
              returnCycleDates.allYear.dueDate.day
            )
          })

          it('should return the due date of the next winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleDueDate(summer, testDate)

            expect(result).toEqual(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-03-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.dueDate.month,
              returnCycleDates.allYear.dueDate.day
            )
          })

          it('should return the due date of the current winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleDueDate(summer, testDate)

            expect(result).toEqual(expectedDate)
          })
        })
      })

      describe('and the determination date is in May last year', () => {
        beforeAll(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.allYear.dueDate.month,
            returnCycleDates.allYear.dueDate.day
          )
        })

        it('should return the correct due date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = ReturnCycleDatesLib.determineCycleDueDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })

      describe('and the determination date is in March last year', () => {
        beforeAll(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.dueDate.month,
            returnCycleDates.allYear.dueDate.day
          )
        })

        it('should return the correct due date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = ReturnCycleDatesLib.determineCycleDueDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })
    })
  })

  describe('determineCycleEndDate', () => {
    describe('when "summer" is true', () => {
      beforeAll(() => {
        summer = true
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-12-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.summer.endDate.month,
              returnCycleDates.summer.endDate.day
            )
          })

          it('should return the end date for the next summer cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleEndDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-09-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.endDate.month,
              returnCycleDates.summer.endDate.day
            )
          })

          it('should return the end date for the current summer cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleEndDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })
      })

      describe('and the determination date is in December last year', () => {
        beforeAll(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.summer.endDate.month,
            returnCycleDates.summer.endDate.day
          )
        })

        it('should return the correct end date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = ReturnCycleDatesLib.determineCycleEndDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })

      describe('and the determination date is in September last year', () => {
        beforeAll(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.endDate.month,
            returnCycleDates.summer.endDate.day
          )
        })

        it('should return the correct end date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = ReturnCycleDatesLib.determineCycleEndDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })
    })

    describe('when "summer" is false', () => {
      beforeAll(() => {
        summer = false
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-05-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.allYear.endDate.month,
              returnCycleDates.allYear.endDate.day
            )
          })

          it('should return the end date of the next winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleEndDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-02-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.endDate.month,
              returnCycleDates.allYear.endDate.day
            )
          })

          it('should return the end date of the current winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleEndDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })
      })

      describe('and the determination date is in May last year', () => {
        beforeAll(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.allYear.endDate.month,
            returnCycleDates.allYear.endDate.day
          )
        })

        it('should return the correct end date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = ReturnCycleDatesLib.determineCycleEndDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })

      describe('and the determination date is in March last year', () => {
        beforeAll(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.endDate.month,
            returnCycleDates.allYear.endDate.day
          )
        })

        it('should return the correct end date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = ReturnCycleDatesLib.determineCycleEndDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })
    })
  })

  describe('determineCycleStartDate', () => {
    describe('when "summer" is true', () => {
      beforeAll(() => {
        summer = true
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-12-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.startDate.month,
              returnCycleDates.summer.startDate.day
            )
          })

          it('should return the start date for the current summer cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleStartDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-09-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear() - 1,
              returnCycleDates.summer.startDate.month,
              returnCycleDates.summer.startDate.day
            )
          })

          it('should return the start date for the previous summer cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleStartDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })
      })

      describe('and the determination date is in December last year', () => {
        beforeAll(() => {
          summer = true
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.startDate.month,
            returnCycleDates.summer.startDate.day
          )
        })

        it('should return the correct end date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = ReturnCycleDatesLib.determineCycleStartDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })

      describe('and the determination date is in September last year', () => {
        beforeAll(() => {
          summer = true
          expectedDate = new Date(
            new Date().getFullYear() - 2,
            returnCycleDates.summer.startDate.month,
            returnCycleDates.summer.startDate.day
          )
        })

        it('should return the correct end date for the summer cycle', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = ReturnCycleDatesLib.determineCycleStartDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })
    })

    describe('when "summer" is false', () => {
      beforeAll(() => {
        summer = false
      })

      describe('and no date is given (defaults to current date)', () => {
        describe('and the current date is after the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-05-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.startDate.month,
              returnCycleDates.allYear.startDate.day
            )
          })

          it('should return the start date of the current winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleStartDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })

        describe('and the current date is before the cycle end', () => {
          beforeEach(() => {
            testDate = new Date(`${year}-02-01`)
            vi.useFakeTimers({ now: testDate })

            expectedDate = new Date(
              new Date().getFullYear() - 1,
              returnCycleDates.allYear.startDate.month,
              returnCycleDates.allYear.startDate.day
            )
          })

          it('should return the start date of the previous winter and all year cycle', () => {
            const result = ReturnCycleDatesLib.determineCycleStartDate(summer)

            expect(result).toEqual(expectedDate)
          })
        })
      })

      describe('and the determination date is in May last year', () => {
        beforeAll(() => {
          summer = false
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.startDate.month,
            returnCycleDates.allYear.startDate.day
          )
        })

        it('should return the correct end date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = ReturnCycleDatesLib.determineCycleStartDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })

      describe('and the determination date is in March last year', () => {
        beforeAll(() => {
          summer = false
          expectedDate = new Date(
            new Date().getFullYear() - 2,
            returnCycleDates.allYear.startDate.month,
            returnCycleDates.allYear.startDate.day
          )
        })

        it('should return the correct end date for the all year cycle', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = ReturnCycleDatesLib.determineCycleStartDate(summer, testDate)

          expect(result).toEqual(expectedDate)
        })
      })
    })
  })
})
