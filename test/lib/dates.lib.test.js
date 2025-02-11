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

    describe('given a startDate and endDate', () => {
      before(async () => {
        startDate = new Date('2023-04-01')
        endDate = new Date('2023-04-03')
      })

      it('returns each day within the period', () => {
        const result = DateLib.daysFromPeriod(startDate, endDate)

        expect(result).to.equal([
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

  describe('weekFromPeriod', () => {
    let startDate
    let endDate

    describe('given a startDate and endDate', () => {
      before(async () => {
        startDate = new Date('2025-02-02')
        endDate = new Date('2025-02-22')
      })

      it('returns each week within the period', () => {
        const result = DateLib.weeksFromPeriod(startDate, endDate)

        expect(result).to.equal([
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

    describe('given a startDate thats after a Sunday (week begins on Sunday)', () => {
      describe('and an endDate thats after a Sunday', () => {
        before(async () => {
          startDate = new Date('2025-02-05')
          endDate = new Date('2025-02-27')
        })

        it('returns the first week starting on the Sunday before the start date', () => {
          const result = DateLib.weeksFromPeriod(startDate, endDate)

          expect(result[0]).to.equal({
            startDate: new Date('2025-02-02'),
            endDate: new Date('2025-02-08')
          })
        })

        it('returns the last week ending on the Friday before the end date', () => {
          const result = DateLib.weeksFromPeriod(startDate, endDate)

          expect(result[2]).to.equal({
            startDate: new Date('2025-02-16'),
            endDate: new Date('2025-02-22')
          })
        })
      })
    })
  })

  describe('monthFromPeriod', () => {
    let startDate
    let endDate

    describe('given a startDate and endDate', () => {
      before(async () => {
        startDate = new Date('2025-02-01')
        endDate = new Date('2025-04-30')
      })

      it('returns each month within the period', () => {
        const result = DateLib.monthsFromPeriod(startDate, endDate)

        expect(result).to.equal([
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

    describe('given a startDate thats after the beginning of the month', () => {
      describe('and an endDate thats after the beginning of a month', () => {
        before(async () => {
          startDate = new Date('2025-02-15')
          endDate = new Date('2025-04-10')
        })

        it('returns the starting month as a full month', () => {
          const result = DateLib.monthsFromPeriod(startDate, endDate)

          expect(result[0]).to.equal({
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-02-28')
          })
        })

        it('returns the last full month before the end date', () => {
          const result = DateLib.monthsFromPeriod(startDate, endDate)

          expect(result[1]).to.equal({
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-03-31')
          })
        })
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
})
