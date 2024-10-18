'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

const { returnCycleDates } = require('../../app/lib/static-lookups.lib.js')

// Thing under test
const DateLib = require('../../app/lib/dates.lib.js')

describe('Dates lib', () => {
  const today = new Date()
  const month = today.getMonth()

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

  describe('cycleDueDate', () => {
    describe('when the requested cycle is "summer"', () => {
      beforeEach(() => {
        summer = true

        if (month > returnCycleDates.summer.endDate.month) {
          expectedDate = new Date(new Date().getFullYear() + 1, 10, 28)
        } else {
          expectedDate = new Date(new Date().getFullYear(), 10, 28)
        }
      })

      it('should return the due date for the current summer cycle', () => {
        const result = DateLib.cycleDueDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year"', () => {
      beforeEach(() => {
        summer = false

        if (month > returnCycleDates.allYear.endDate.month) {
          expectedDate = new Date(new Date().getFullYear() + 1, 3, 28)
        } else {
          expectedDate = new Date(new Date().getFullYear(), 3, 28)
        }
      })

      it('should return the due date of the current winter and all year cycle', () => {
        const result = DateLib.cycleDueDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleDueDateAsISO', () => {
    describe('when the requested cycle is "summer"', () => {
      beforeEach(() => {
        summer = true

        if (month > returnCycleDates.summer.endDate.month) {
          expectedDate = new Date(new Date().getFullYear() + 1, 10, 28).toISOString().split('T')[0]
        } else {
          expectedDate = new Date(new Date().getFullYear(), 10, 28).toISOString().split('T')[0]
        }
      })

      it('should return the due date for the current summer cycle formatted as YYYY-MM-DD', () => {
        const result = DateLib.cycleDueDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year"', () => {
      beforeEach(() => {
        summer = false

        if (month > returnCycleDates.allYear.endDate.month) {
          expectedDate = new Date(new Date().getFullYear() + 1, 3, 28).toISOString().split('T')[0]
        } else {
          expectedDate = new Date(new Date().getFullYear(), 3, 28).toISOString().split('T')[0]
        }
      })

      it('should return the due date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = DateLib.cycleDueDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleEndDate', () => {
    describe('when the requested cycle is "summer"', () => {
      beforeEach(() => {
        summer = true

        if (month > returnCycleDates.summer.endDate.month) {
          expectedDate = new Date(new Date().getFullYear() + 1, 9, 31)
        } else {
          expectedDate = new Date(new Date().getFullYear(), 9, 31)
        }
      })

      it('should return the due date for the current summer cycle', () => {
        const result = DateLib.cycleEndDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year"', () => {
      beforeEach(() => {
        summer = false

        if (month > returnCycleDates.allYear.endDate.month) {
          expectedDate = new Date(new Date().getFullYear() + 1, 2, 31)
        } else {
          expectedDate = new Date(new Date().getFullYear(), 2, 31)
        }
      })

      it('should return the due date of the current winter and all year cycle', () => {
        const result = DateLib.cycleEndDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleEndDateAsISO', () => {
    describe('when the requested cycle is "summer"', () => {
      beforeEach(() => {
        summer = true

        if (month > returnCycleDates.summer.endDate.month) {
          expectedDate = new Date(new Date().getFullYear() + 1, 9, 31).toISOString().split('T')[0]
        } else {
          expectedDate = new Date(new Date().getFullYear(), 9, 31).toISOString().split('T')[0]
        }
      })

      it('should return the due date for the current summer cycle formatted as YYYY-MM-DD', () => {
        const result = DateLib.cycleEndDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year"', () => {
      beforeEach(() => {
        summer = false

        if (month > returnCycleDates.allYear.endDate.month) {
          expectedDate = new Date(new Date().getFullYear() + 1, 2, 31).toISOString().split('T')[0]
        } else {
          expectedDate = new Date(new Date().getFullYear(), 2, 31).toISOString().split('T')[0]
        }
      })

      it('should return the due date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = DateLib.cycleEndDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleStartDate', () => {
    describe('when the requested cycle is "summer"', () => {
      beforeEach(() => {
        summer = true

        if (month < returnCycleDates.summer.startDate.month) {
          expectedDate = new Date(new Date().getFullYear() - 1, 10, 1)
        } else {
          expectedDate = new Date(new Date().getFullYear(), 10, 1)
        }
      })

      it('should return the start date for the current summer cycle', () => {
        const result = DateLib.cycleStartDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year"', () => {
      beforeEach(() => {
        summer = false

        if (month < returnCycleDates.allYear.startDate.month) {
          expectedDate = new Date(new Date().getFullYear() - 1, 3, 1)
        } else {
          expectedDate = new Date(new Date().getFullYear(), 3, 1)
        }
      })

      it('should return the due date of the current winter and all year cycle', () => {
        const result = DateLib.cycleStartDate(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })

  describe('cycleStartDateAsISO', () => {
    describe('when the requested cycle is "summer"', () => {
      beforeEach(() => {
        summer = true

        if (month < returnCycleDates.summer.startDate.month) {
          expectedDate = new Date(new Date().getFullYear() - 1, 10, 1).toISOString().split('T')[0]
        } else {
          expectedDate = new Date(new Date().getFullYear(), 10, 1).toISOString().split('T')[0]
        }
      })

      it('should return the start date for the current summer cycle formatted as YYYY-MM-DD', () => {
        const result = DateLib.cycleStartDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })

    describe('when the requested cycle is "winter and all year"', () => {
      beforeEach(() => {
        summer = false

        if (month < returnCycleDates.allYear.startDate.month) {
          expectedDate = new Date(new Date().getFullYear() - 1, 3, 1).toISOString().split('T')[0]
        } else {
          expectedDate = new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]
        }

        expectedDate = new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]
      })

      it('should return the due date of the current winter and all year cycle formatted as YYYY-MM-DD', () => {
        const result = DateLib.cycleStartDateAsISO(summer)

        expect(result).to.equal(expectedDate)
      })
    })
  })
})
