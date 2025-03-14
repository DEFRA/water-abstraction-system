'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const DateLib = require('../../app/lib/dates.lib.js')

describe('Dates lib', () => {
  describe('daysFromPeriod', () => {
    let startDate
    let endDate

    describe('given a "startDate" and "endDate"', () => {
      before(async () => {
        startDate = new Date('2023-04-01')
        endDate = new Date('2023-04-03')
      })

      it('returns a "day" object for each day within the period (inclusive)', () => {
        const results = DateLib.daysFromPeriod(startDate, endDate)

        expect(results).to.equal([
          {
            startDate: new Date('2023-04-01'),
            endDate: new Date('2023-04-01')
          },
          {
            startDate: new Date('2023-04-02'),
            endDate: new Date('2023-04-02')
          },
          {
            startDate: new Date('2023-04-03'),
            endDate: new Date('2023-04-03')
          }
        ])
      })
    })
  })

  describe('determineFinancialYearEnd', () => {
    let date

    describe('given a date starting on or after 1st April', () => {
      before(async () => {
        date = new Date('2022-04-01')
      })

      it('returns the correct financial year end', () => {
        const result = DateLib.determineFinancialYearEnd(date)

        expect(result).to.equal(2023)
      })
    })

    describe('given a date starting before 1st April', () => {
      before(async () => {
        date = new Date('2022-02-21')
      })

      it('returns the correct financial year end', () => {
        const result = DateLib.determineFinancialYearEnd(date)

        expect(result).to.equal(2022)
      })
    })
  })

  describe('determineEarliestDate', () => {
    let dates

    describe('given an array of dates', () => {
      before(async () => {
        dates = [new Date('2025-04-01'), new Date('2025-03-30'), new Date('2025-03-31')]
      })

      it('returns the earliest as a Date value', () => {
        const result = DateLib.determineEarliestDate(dates)

        expect(result).to.equal(new Date('2025-03-30'))
      })
    })

    describe('given an array of that contains date, null and undefined values', () => {
      before(() => {
        dates = [new Date('2025-04-01'), null, new Date('2025-03-30'), undefined]
      })

      it('still returns the earliest as a Date value', () => {
        const result = DateLib.determineEarliestDate(dates)

        expect(result).to.equal(new Date('2025-03-30'))
      })
    })

    describe('given an array that only contains null and undefined values', () => {
      before(() => {
        dates = [null, undefined]
      })

      it('returns null', () => {
        const result = DateLib.determineEarliestDate(dates)
        expect(result).to.equal(null)
      })
    })

    describe('given an empty array', () => {
      before(() => {
        dates = []
      })

      it('returns null', () => {
        const result = DateLib.determineEarliestDate(dates)
        expect(result).to.equal(null)
      })
    })
  })

  describe('determineLatestDate', () => {
    let dates

    describe('given an array of dates', () => {
      before(async () => {
        dates = [new Date('2025-04-01'), new Date('2025-03-30'), new Date('2025-03-31')]
      })

      it('returns the latest as a Date value', () => {
        const result = DateLib.determineLatestDate(dates)

        expect(result).to.equal(new Date('2025-04-01'))
      })
    })

    describe('given an array of that contains date, null and undefined values', () => {
      before(() => {
        dates = [new Date('2025-04-01'), null, new Date('2025-03-30'), undefined]
      })

      it('still returns the latest as a Date value', () => {
        const result = DateLib.determineLatestDate(dates)

        expect(result).to.equal(new Date('2025-04-01'))
      })
    })

    describe('given an array that only contains null and undefined values', () => {
      before(() => {
        dates = [null, undefined]
      })

      it('throws an error', () => {
        expect(() => {
          return DateLib.determineLatestDate(dates)
        }).to.throw('No dates provided to determine earliest')
      })
    })

    describe('given an empty array', () => {
      before(() => {
        dates = []
      })

      it('throws an error', () => {
        expect(() => {
          return DateLib.determineLatestDate(dates)
        }).to.throw('No dates provided to determine earliest')
      })
    })
  })

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

  describe('monthFromPeriod', () => {
    let startDate
    let endDate

    describe('given a "startDate" that is the first of the month and an "endDate" that is the last of the month', () => {
      before(async () => {
        startDate = new Date('2025-02-01')
        endDate = new Date('2025-04-30')
      })

      it('returns a "month" object for each month within the period', () => {
        const results = DateLib.monthsFromPeriod(startDate, endDate)

        expect(results).to.equal([
          {
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-02-28')
          },
          {
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-03-31')
          },
          {
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-04-30')
          }
        ])
      })
    })

    describe('given a "startDate" that is in the middle and an "endDate" that is the last of the month', () => {
      before(async () => {
        startDate = new Date('2025-02-15')
        endDate = new Date('2025-04-30')
      })

      it('sets the start date of the first "month" back to the 1st', () => {
        const results = DateLib.monthsFromPeriod(startDate, endDate)

        expect(results[0]).to.equal({
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-02-28')
        })
      })
    })

    describe('given a "startDate" that is the first of the month and an "endDate" that is in the middle', () => {
      before(async () => {
        startDate = new Date('2025-02-01')
        endDate = new Date('2025-04-15')
      })

      it('sets the end date of the last "month" forward to the last of the month', () => {
        const results = DateLib.monthsFromPeriod(startDate, endDate)

        expect(results[results.length - 1]).to.equal({
          startDate: new Date('2025-04-01'),
          endDate: new Date('2025-04-30')
        })
      })
    })
  })

  describe('weekFromPeriod', () => {
    let startDate
    let endDate

    describe('given a "startDate" that is a Sunday and an "endDate" that is a Saturday', () => {
      before(async () => {
        // Sunday
        startDate = new Date('2025-02-02')
        // Saturday
        endDate = new Date('2025-02-22')
      })

      it('returns a "week" object for each week (Sunday to Saturday) within the period', () => {
        const results = DateLib.weeksFromPeriod(startDate, endDate)

        expect(results).to.equal([
          {
            startDate: new Date('2025-02-02'),
            endDate: new Date('2025-02-08')
          },
          {
            startDate: new Date('2025-02-09'),
            endDate: new Date('2025-02-15')
          },
          {
            startDate: new Date('2025-02-16'),
            endDate: new Date('2025-02-22')
          }
        ])
      })
    })
    describe('given a "startDate" that is Wednesday and an "endDate" that is a Saturday', () => {
      before(async () => {
        // Wednesday
        startDate = new Date('2025-02-05')
        // Saturday
        endDate = new Date('2025-02-22')
      })

      it('sets the start date of the first "week" back to the Sunday (start of the week)', () => {
        const results = DateLib.weeksFromPeriod(startDate, endDate)

        expect(results[0]).to.equal({
          startDate: new Date('2025-02-02'),
          endDate: new Date('2025-02-08')
        })
      })
    })

    describe('given a "startDate" that is Sunday and an "endDate" that is a Thursday', () => {
      before(async () => {
        // Sunday
        startDate = new Date('2025-02-02')
        // Thursday
        endDate = new Date('2025-02-27')
      })

      it('sets the last "week" as the last full week (Sun to Sat) before the "endDate"', () => {
        const results = DateLib.weeksFromPeriod(startDate, endDate)

        expect(results[results.length - 1]).to.equal({
          startDate: new Date('2025-02-16'),
          endDate: new Date('2025-02-22')
        })
      })
    })
  })
})
