'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const DateLib = require('../../app/lib/dates.lib.js')

describe('Dates lib', () => {
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

  describe('dueDateOfSummerCycle', () => {
    it('should return the due date of the summer cycle', () => {
      const summerDueDate = new Date(new Date().getFullYear() + 1, 10, 28)
      const result = DateLib.dueDateOfSummerCycle()

      expect(result).to.equal(summerDueDate)
    })
  })

  describe('dueDateOfWinterAndAllYearCycle', () => {
    it('should return the due date of the winter and all year cycle', () => {
      const allYearDueDate = new Date(new Date().getFullYear() + 1, 3, 28)
      const result = DateLib.dueDateOfWinterAndAllYearCycle()

      expect(result).to.equal(allYearDueDate)
    })
  })

  describe('endOfSummerCycle', () => {
    it('should return the end date of the summer cycle', () => {
      const summerEndDate = new Date(new Date().getFullYear() + 1, 9, 31)
      const result = DateLib.endOfSummerCycle()

      expect(result).to.equal(summerEndDate)
    })
  })

  describe('endOfWinterAndAllYearCycle', () => {
    it('should return the end date of the winter and all year cycle', () => {
      const allYearEndDate = new Date(new Date().getFullYear() + 1, 2, 31)
      const result = DateLib.endOfWinterAndAllYearCycle()

      expect(result).to.equal(allYearEndDate)
    })
  })

  describe('getCycleDueDate', () => {
    it('should return the due date of the summer cycle as an ISO string', () => {
      const summerDueDate = new Date(new Date().getFullYear() + 1, 10, 28).toISOString().split('T')[0]
      const result = DateLib.getCycleDueDate(true)

      expect(result).to.equal(summerDueDate)
    })
  })

  describe('getCycleDueDate', () => {
    it('should return the due date of the winter and all year cycle as an ISO string', () => {
      const allYearDueDate = new Date(new Date().getFullYear() + 1, 3, 28).toISOString().split('T')[0]
      const result = DateLib.getCycleDueDate(false)

      expect(result).to.equal(allYearDueDate)
    })
  })

  describe('getCycleEndDate', () => {
    it('should return the end date of the summer cycle as an ISO string', () => {
      const summerEndDate = new Date(new Date().getFullYear() + 1, 9, 31).toISOString().split('T')[0]
      const result = DateLib.getCycleEndDate(true)

      expect(result).to.equal(summerEndDate)
    })
  })

  describe('getCycleEndDate', () => {
    it('should return the end date of the winter and all year cycle as an ISO string', () => {
      const allYearEndDate = new Date(new Date().getFullYear() + 1, 2, 31).toISOString().split('T')[0]
      const result = DateLib.getCycleEndDate(false)

      expect(result).to.equal(allYearEndDate)
    })
  })

  describe('getCycleStartDate', () => {
    it('should return the start date of the summer cycle as an ISO string', () => {
      const summerStartDate = new Date(new Date().getFullYear(), 10, 1).toISOString().split('T')[0]
      const result = DateLib.getCycleStartDate(true)

      expect(result).to.equal(summerStartDate)
    })
  })

  describe('getCycleStartDate', () => {
    it('should return the start date of the winter and all year cycle as an ISO string', () => {
      const allYearStartDate = new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]
      const result = DateLib.getCycleStartDate(false)

      expect(result).to.equal(allYearStartDate)
    })
  })

  describe('startOfSummerCycle', () => {
    it('should return the start date of the summer cycle', () => {
      const summerStartDate = new Date(new Date().getFullYear(), 10, 1)
      const result = DateLib.startOfSummerCycle()

      expect(result).to.equal(summerStartDate)
    })
  })

  describe('startOfWinterAndAllYearCycle', () => {
    it('should return the start date of the winter and all year cycle', () => {
      const allYearStartDate = new Date(new Date().getFullYear(), 3, 1)
      const result = DateLib.startOfWinterAndAllYearCycle()

      expect(result).to.equal(allYearStartDate)
    })
  })
})
