'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const BasePresenter = require('../../app/presenters/base.presenter.js')

describe('Base presenter', () => {
  describe('#convertPenceToPounds()', () => {
    let valueInPence

    describe('when the value divides evenly', () => {
      beforeEach(() => {
        valueInPence = 114900
      })

      it('correctly returns the value in pounds, for example, 1149', async () => {
        const result = BasePresenter.convertPenceToPounds(valueInPence)

        expect(result).to.equal(1149)
      })
    })

    describe('when the value does not divide evenly', () => {
      beforeEach(() => {
        valueInPence = 114901
      })

      it('correctly returns the value in pounds, for example, 1149.01', async () => {
        const result = BasePresenter.convertPenceToPounds(valueInPence)

        expect(result).to.equal(1149.01)
      })
    })
  })

  describe('#formatAbstractionDate()', () => {
    const day = 12
    const month = 9

    it('correctly formats the given date, for example, 12 September', async () => {
      const result = BasePresenter.formatAbstractionDate(day, month)

      expect(result).to.equal('12 September')
    })
  })

  describe('#formatAbstractionPeriod()', () => {
    const startDay = 1
    const startMonth = 4
    const endDay = 12
    const endMonth = 9

    it('correctly formats the given period, for example, 1 April to 12 September', async () => {
      const result = BasePresenter.formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)

      expect(result).to.equal('1 April to 12 September')
    })
  })

  describe('#formatChargingModuleDate()', () => {
    it('correctly formats the given date, for example, 12-SEP-2021', async () => {
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

      expect(results).to.equal([
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
    it('correctly formats the given date, for example, 12 September 2021', async () => {
      const result = BasePresenter.formatLongDate(new Date('2021-09-12T14:41:10.511Z'))

      expect(result).to.equal('12 September 2021')
    })
  })

  describe('#leftPadZeroes()', () => {
    it('correctly pads numbers', async () => {
      const number = 123
      const result = BasePresenter.leftPadZeroes(number, 7)

      expect(result).to.equal('0000123')
    })
  })
})
