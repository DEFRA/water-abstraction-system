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

    it('throws an error is the date is not a valid date', () => {
      expect(() => {
        return DateLib.formatStandardDateToISO('20/07/20')
      }).to.throw('20-07-20 is not a valid date')
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
        it('returns true', () => {
          const result = DateLib.isValidDate('2020-02-29')

          expect(result).to.be.true()
        })
      })

      describe('and the date is 2020-02-30 (not a valid date)', () => {
        it('returns false', () => {
          const result = DateLib.isValidDate('2020-02-30')

          expect(result).to.be.false()
        })
      })

      describe('and the year is divisible by 400', () => {
        it('returns true', () => {
          const result = DateLib.isValidDate('2000-02-20')

          expect(result).to.be.true()
        })
      })
    })

    describe('if the year is not a leap year', () => {
      describe('and the day is greater than the last day of February 2021-02-28 in a none leap year', () => {
        it('returns false', () => {
          const result = DateLib.isValidDate('2021-02-29')

          expect(result).to.be.false()
        })
      })

      describe('and the day is greater than the last day of a leap year', () => {
        it('returns false', () => {
          const result = DateLib.isValidDate('1999-02-30')

          expect(result).to.be.false()
        })
      })

      describe('and the month is not February', () => {
        it('returns true', () => {
          const result = DateLib.isValidDate('1999-03-27')

          expect(result).to.be.true()
        })
      })

      describe('and the day is not before the last day of February', () => {
        it('returns true', () => {
          const result = DateLib.isValidDate('1999-02-27')

          expect(result).to.be.true()
        })
      })
    })
  })

  describe('isISODateFormat', () => {
    it('should return false if the date is not in the iso format - yyyy-mm-dd', () => {
      const result = DateLib.isISODateFormat('20/07/2020')

      expect(result).to.be.false()
    })

    it('should return true if the date is in the iso format - yyyy-mm-dd', () => {
      const result = DateLib.isISODateFormat('2020-07-20')

      expect(result).to.be.true()
    })
  })

  describe('isQuarterlyReturnSubmissions', () => {
    it('should return true if the date is >= 2025-04-01', () => {
      const result = DateLib.isQuarterlyReturnSubmissions('2025-04-01')

      expect(result).to.be.true()
    })

    it('should return false if the date is < 2025-04-01', () => {
      const result = DateLib.isQuarterlyReturnSubmissions('2025-03-31')

      expect(result).to.be.false()
    })
  })

  describe('earliestDate', () => {
    it('should return the earliest date of 2025-04-01, 2025-03-31, 2025-03-30', () => {
      const result = DateLib.earliestDate(['2025-04-01', '2025-03-31', '2025-03-30'])

      expect(result).to.equal(new Date('2025-03-30'))
    })

    it('should be able to handle null valuse and still return the earliest date', () => {
      const result = DateLib.earliestDate(['2025-04-01', null, '2025-03-31', '2025-03-30'])

      expect(result).to.equal(new Date('2025-03-30'))
    })
  })
})
