'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

const { returnCycleDates } = require('../../app/lib/static-lookups.lib.js')

// Thing under test
const DateLib = require('../../app/lib/dates.lib.js')

describe('Dates lib', () => {
  const today = new Date()
  const month = today.getMonth()
  const year = today.getFullYear()

  let expectedDate
  let summer

  describe('formatStandardDateToISO', () => {
    it('returns null if the date is null ', () => {
      const result = DateLib.formatStandardDateToISO(null)

      expect(result).to.be.null()
    })

    it('returns null if the date is "null" (NALD dates are a string with null)', () => {
      const result = DateLib.formatStandardDateToISO('null')

      expect(result).to.be.null()
    })

    it('returns an iso date string in the format yyyy-mm-dd', () => {
      const result = DateLib.formatStandardDateToISO('20/07/2020')

      expect(result).to.equal('2020-07-20')
    })
  })

  describe('isValidDate', () => {
    it('should return false is no date provided', () => {
      const result = DateLib.isValidDate()

      expect(result).to.be.false()
    })

    it('should return true if the date is valid', () => {
      const result = DateLib.isValidDate('2020-07-20')

      expect(result).to.be.true()
    })

    describe('if the year is a leap year', () => {
      describe('and the date is 2020-02-29 (a valid date)', () => {
        it('returns the date', () => {
          const result = DateLib.isValidDate('2020-02-29')

          expect(result).to.be.true()
        })
      })

      describe('and the date is 2020-02-30 (not a valid date)', () => {
        it('returns the date', () => {
          const result = DateLib.isValidDate('2020-02-30')

          expect(result).to.be.false()
        })
      })
    })

    describe('if the year is not a leap year', () => {
      describe('and the date is 2021-02-29', () => {
        it('returns false', () => {
          const result = DateLib.isValidDate('2021-02-29')

          expect(result).to.be.false()
        })
      })
    })
  })

  describe('isISODateFormat', () => {
    it('should return false if the date is not in the iso format - yyyy-mm-dd', () => {
      const result = DateLib.isValidDate('20/07/2020')

      expect(result).to.be.false()
    })

    it('should return true if the date is in the iso format - yyyy-mm-dd', () => {
      const result = DateLib.isValidDate('2020-07-20')

      expect(result).to.be.true()
    })
  })

  describe('Return cycle dates', () => {
    describe('when summer is true', () => {
      before(() => {
        summer = true
      })

      describe('cycleDueDate', () => {
        before(() => {
          if (month > returnCycleDates.summer.endDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.summer.dueDate.month,
              returnCycleDates.summer.dueDate.day
            )
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.dueDate.month,
              returnCycleDates.summer.dueDate.day
            )
          }
        })

        it('should return the due date for the current summer cycle', () => {
          const result = DateLib.cycleDueDate(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleDueDateAsISO', () => {
        before(() => {
          if (month > returnCycleDates.summer.endDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.summer.dueDate.month,
              returnCycleDates.summer.dueDate.day
            ).toISOString().split('T')[0]
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.dueDate.month,
              returnCycleDates.summer.dueDate.day
            ).toISOString().split('T')[0]
          }
        })

        it('should return the due date for the current summer cycle formatted as YYYY-MM-DD', () => {
          const result = DateLib.cycleDueDateAsISO(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleDueDateByDate when given a date in december last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.summer.dueDate.month,
            returnCycleDates.summer.dueDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct due date for the summer cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = DateLib.cycleDueDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleDueDateByDate when given a date in september last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.dueDate.month,
            returnCycleDates.summer.dueDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct due date for the summer cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = DateLib.cycleDueDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleEndDate', () => {
        before(() => {
          if (month > returnCycleDates.summer.endDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.summer.endDate.month,
              returnCycleDates.summer.endDate.day
            )
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.endDate.month,
              returnCycleDates.summer.endDate.day
            )
          }
        })

        it('should return the end date for the current summer cycle', () => {
          const result = DateLib.cycleEndDate(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleEndDateAsISO', () => {
        before(() => {
          if (month > returnCycleDates.summer.endDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.summer.endDate.month,
              returnCycleDates.summer.endDate.day
            ).toISOString().split('T')[0]
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.endDate.month,
              returnCycleDates.summer.endDate.day
            ).toISOString().split('T')[0]
          }
        })

        it('should return the end date for the current summer cycle formatted as YYYY-MM-DD', () => {
          const result = DateLib.cycleEndDateAsISO(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleEndDateByDate when given a date in december last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.summer.endDate.month,
            returnCycleDates.summer.endDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct end date for the summer cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = DateLib.cycleEndDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleEndDateByDate when given a date in september last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.endDate.month,
            returnCycleDates.summer.endDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct end date for the summer cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = DateLib.cycleEndDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleStartDate', () => {
        before(() => {
          if (month < returnCycleDates.summer.startDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() - 1,
              returnCycleDates.summer.startDate.month,
              returnCycleDates.summer.startDate.day
            )
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.startDate.month,
              returnCycleDates.summer.startDate.day
            )
          }
        })

        it('should return the start date for the current summer cycle', () => {
          const result = DateLib.cycleStartDate(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleStartDateAsISO', () => {
        before(() => {
          if (month < returnCycleDates.summer.startDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() - 1,
              returnCycleDates.summer.startDate.month,
              returnCycleDates.summer.startDate.day
            ).toISOString().split('T')[0]
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.summer.startDate.month,
              returnCycleDates.summer.startDate.day
            ).toISOString().split('T')[0]
          }
        })

        it('should return the start date for the current summer cycle formatted as YYYY-MM-DD', () => {
          const result = DateLib.cycleStartDateAsISO(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleStartDateByDate when given a date in december last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.summer.startDate.month,
            returnCycleDates.summer.startDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct start date for the summer cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-12-01`)
          const result = DateLib.cycleStartDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleStartDateByDate when given a date in september last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 2,
            returnCycleDates.summer.startDate.month,
            returnCycleDates.summer.startDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct start date for the summer cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-09-01`)
          const result = DateLib.cycleStartDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })
    })

    describe('when summer is false', () => {
      before(() => {
        summer = false
      })

      describe('cycleDueDate', () => {
        before(() => {
          if (month > returnCycleDates.allYear.endDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.allYear.dueDate.month,
              returnCycleDates.allYear.dueDate.day
            )
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.dueDate.month,
              returnCycleDates.allYear.dueDate.day
            )
          }
        })

        it('should return the due date for the current all year cycle', () => {
          const result = DateLib.cycleDueDate(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleDueDateAsISO', () => {
        before(() => {
          if (month > returnCycleDates.allYear.endDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.allYear.dueDate.month,
              returnCycleDates.allYear.dueDate.day
            ).toISOString().split('T')[0]
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.dueDate.month,
              returnCycleDates.allYear.dueDate.day
            ).toISOString().split('T')[0]
          }
        })

        it('should return the due date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
          const result = DateLib.cycleDueDateAsISO(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleDueDateByDate when given a date in may last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.allYear.dueDate.month,
            returnCycleDates.allYear.dueDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct due date for the all year cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = DateLib.cycleDueDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleDueDateByDate when given a date in march last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.dueDate.month,
            returnCycleDates.allYear.dueDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct due date for the all year cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = DateLib.cycleDueDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleEndDate', () => {
        before(() => {
          if (month > returnCycleDates.allYear.endDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.allYear.endDate.month,
              returnCycleDates.allYear.endDate.day
            )
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.endDate.month,
              returnCycleDates.allYear.endDate.day
            )
          }
        })

        it('should return the due date for the current all year cycle', () => {
          const result = DateLib.cycleEndDate(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleEndDateAsISO', () => {
        before(() => {
          if (month > returnCycleDates.allYear.endDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() + 1,
              returnCycleDates.allYear.endDate.month,
              returnCycleDates.allYear.endDate.day
            ).toISOString().split('T')[0]
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.endDate.month,
              returnCycleDates.allYear.endDate.day
            ).toISOString().split('T')[0]
          }
        })

        it('should return the due date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
          const result = DateLib.cycleEndDateAsISO(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleEndDateByDate when given a date in may last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear(),
            returnCycleDates.allYear.endDate.month,
            returnCycleDates.allYear.endDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct end date for the all year cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = DateLib.cycleEndDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleEndDateByDate when given a date in march last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.endDate.month,
            returnCycleDates.allYear.endDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct end date for the all year cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = DateLib.cycleEndDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleStartDate', () => {
        before(() => {
          if (month < returnCycleDates.allYear.startDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() - 1,
              returnCycleDates.allYear.startDate.month,
              returnCycleDates.allYear.startDate.day
            )
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.startDate.month,
              returnCycleDates.allYear.startDate.day
            )
          }
        })

        it('should return the start date for the current winter and all year cycle', () => {
          const result = DateLib.cycleStartDate(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleStartDateAsISO', () => {
        before(() => {
          if (month < returnCycleDates.allYear.startDate.month) {
            expectedDate = new Date(
              new Date().getFullYear() - 1,
              returnCycleDates.allYear.startDate.month,
              returnCycleDates.allYear.startDate.day
            ).toISOString().split('T')[0]
          } else {
            expectedDate = new Date(
              new Date().getFullYear(),
              returnCycleDates.allYear.startDate.month,
              returnCycleDates.allYear.startDate.day
            ).toISOString().split('T')[0]
          }
        })

        it('should return the due date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
          const result = DateLib.cycleStartDateAsISO(summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleStartDateByDate when given a date in may last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 1,
            returnCycleDates.allYear.startDate.month,
            returnCycleDates.allYear.startDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct start date for the all year cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-05-01`)
          const result = DateLib.cycleStartDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })

      describe('cycleStartDateByDate when given a date in march last year', () => {
        before(() => {
          expectedDate = new Date(
            new Date().getFullYear() - 2,
            returnCycleDates.allYear.startDate.month,
            returnCycleDates.allYear.startDate.day
          ).toISOString().split('T')[0]
        })

        it('should return the correct start date for the all year cycle formatted as YYYY-MM-DD', () => {
          const testDate = new Date(`${year - 1}-03-01`)
          const result = DateLib.cycleStartDateByDate(testDate, summer)

          expect(result).to.equal(expectedDate)
        })
      })
    })
  })
})
