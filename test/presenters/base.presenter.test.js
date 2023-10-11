'use strict'

const BasePresenter = require('../../app/presenters/base.presenter.js')

describe('Base presenter', () => {
  describe('#capitalize()', () => {
    let valueToCapitalize

    describe('when the value is a single word', () => {
      beforeEach(() => {
        valueToCapitalize = 'high'
      })

      it('correctly returns the value capitalized, for example, High', () => {
        const result = BasePresenter.capitalize(valueToCapitalize)

        expect(result).toBe('High')
      })
    })

    describe('when the value is multiple words', () => {
      beforeEach(() => {
        valueToCapitalize = 'spray irrigation'
      })

      it('correctly returns the value capitalized, for example, Spray Irrigation', () => {
        const result = BasePresenter.capitalize(valueToCapitalize)

        expect(result).toBe('Spray Irrigation')
      })
    })

    describe('when the value contains a symbol', () => {
      beforeEach(() => {
        valueToCapitalize = 'spray irrigation - direct'
      })

      it('correctly returns the value capitalized, for example, Spray Irrigation - Direct', () => {
        const result = BasePresenter.capitalize(valueToCapitalize)

        expect(result).toBe('Spray Irrigation - Direct')
      })
    })

    describe('when the value is all capitals', () => {
      beforeEach(() => {
        valueToCapitalize = 'SPRAY IRRIGATION'
      })

      it('correctly returns the value unchanged, for example, SPRAY IRRIGATION', () => {
        const result = BasePresenter.capitalize(valueToCapitalize)

        expect(result).toBe('SPRAY IRRIGATION')
      })
    })
  })

  describe('#convertPenceToPounds()', () => {
    let valueInPence

    describe('when the value divides evenly', () => {
      beforeEach(() => {
        valueInPence = 114900
      })

      it('correctly returns the value in pounds, for example, 1149', () => {
        const result = BasePresenter.convertPenceToPounds(valueInPence)

        expect(result).toBe(1149)
      })
    })

    describe('when the value does not divide evenly', () => {
      beforeEach(() => {
        valueInPence = 114901
      })

      it('correctly returns the value in pounds, for example, 1149.01', () => {
        const result = BasePresenter.convertPenceToPounds(valueInPence)

        expect(result).toBe(1149.01)
      })
    })
  })

  describe('#formatAbstractionDate()', () => {
    const day = 12
    const month = 9

    it('correctly formats the given date, for example, 12 September', () => {
      const result = BasePresenter.formatAbstractionDate(day, month)

      expect(result).toBe('12 September')
    })
  })

  describe('#formatAbstractionPeriod()', () => {
    const startDay = 1
    const startMonth = 4
    const endDay = 12
    const endMonth = 9

    it('correctly formats the given period, for example, 1 April to 12 September', () => {
      const result = BasePresenter.formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)

      expect(result).toBe('1 April to 12 September')
    })
  })

  describe('#formatChargingModuleDate()', () => {
    it('correctly formats the given date', () => {
      // We check an array of dates, one for each month, to ensure that every month is formatted correctly
      const results = [
        new Date('2021-01-01T14:41:10.511Z'),
        new Date('2021-02-01T14:41:10.511Z'),
        new Date('2021-03-01T14:41:10.511Z'),
        new Date('2021-04-01T14:41:10.511Z'),
        new Date('2021-05-01T14:41:10.511Z'),
        new Date('2021-06-01T14:41:10.511Z'),
        new Date('2021-07-12T14:41:10.511Z'),
        new Date('2021-08-12T14:41:10.511Z'),
        new Date('2021-09-12T14:41:10.511Z'),
        new Date('2021-10-12T14:41:10.511Z'),
        new Date('2021-11-12T14:41:10.511Z'),
        new Date('2021-12-12T14:41:10.511Z')
      ].map(date => BasePresenter.formatChargingModuleDate(date))

      expect(results).toEqual([
        '01-JAN-2021',
        '01-FEB-2021',
        '01-MAR-2021',
        '01-APR-2021',
        '01-MAY-2021',
        '01-JUN-2021',
        '12-JUL-2021',
        '12-AUG-2021',
        '12-SEP-2021',
        '12-OCT-2021',
        '12-NOV-2021',
        '12-DEC-2021'
      ])
    })
  })

  describe('#formatLongDate()', () => {
    it('correctly formats the given date', () => {
      const result = BasePresenter.formatLongDate(new Date('2021-09-12T14:41:10.511Z'))

      expect(result).toBe('12 September 2021')
    })
  })

  describe('#formatLongDateTime()', () => {
    it('correctly formats the given date', () => {
      const result = BasePresenter.formatLongDateTime(new Date('2021-09-12T14:41:10.511Z'))

      expect(result).toBe('12 September 2021 at 14:41:10')
    })
  })

  describe('#formatNumberAsMoney()', () => {
    const valueInPence = 1149.5

    describe('when no £ symbol is requested', () => {
      it('correctly returns the value as a money string with no symbol, for example, 1149.50', () => {
        const result = BasePresenter.formatNumberAsMoney(valueInPence)

        expect(result).toBe('1149.50')
      })
    })

    describe('when the £ symbol is requested', () => {
      it('correctly returns the value as a money string with a symbol, for example, £1149.50', () => {
        const result = BasePresenter.formatNumberAsMoney(valueInPence, true)

        expect(result).toBe('£1149.50')
      })
    })
  })

  describe('#leftPadZeroes()', () => {
    it('correctly pads numbers', () => {
      const number = 123
      const result = BasePresenter.leftPadZeroes(number, 7)

      expect(result).toBe('0000123')
    })
  })
})
