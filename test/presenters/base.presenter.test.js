'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
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

  describe('#generateBillRunTitle()', () => {
    const regionName = 'anglian'
    const batchType = 'two_part_tariff'
    const scheme = 'sroc'
    const summer = false

    it('generates the page title for the bill run, for example, "Anglian two-part tariff"', () => {
      const result = BasePresenter.generateBillRunTitle(regionName, batchType, scheme, summer)

      expect(result).to.equal('Anglian two-part tariff')
    })
  })

  describe('#formatAbstractionDate()', () => {
    let day
    let month

    describe('when the abstraction day and month are not set', () => {
      it('returns null', async () => {
        const result = BasePresenter.formatAbstractionDate(day, month)

        expect(result).to.be.null()
      })
    })

    describe('when the abstraction day and month are set', () => {
      beforeEach(() => {
        day = 12
        month = 9
      })

      it('correctly formats the given date, for example, 12 September', async () => {
        const result = BasePresenter.formatAbstractionDate(day, month)

        expect(result).to.equal('12 September')
      })
    })
  })

  describe('#formatAbstractionPeriod()', () => {
    let startDay
    let startMonth
    let endDay
    let endMonth

    describe('when the abstraction period is not set', () => {
      it('returns the "Not given" message', async () => {
        const result = BasePresenter.formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)

        expect(result).to.equal('Not given')
      })
    })

    describe('when the abstraction period is set', () => {
      beforeEach(() => {
        startDay = 1
        startMonth = 4
        endDay = 12
        endMonth = 9
      })

      it('correctly formats the given period, for example, 1 April to 12 September', async () => {
        const result = BasePresenter.formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)

        expect(result).to.equal('1 April to 12 September')
      })
    })
  })

  describe('#formatBillRunType()', () => {
    let batchType
    let scheme
    let summer

    describe('when the batch type is "annual"', () => {
      beforeEach(() => {
        batchType = 'annual'
      })

      it('returns "Annual"', () => {
        const result = BasePresenter.formatBillRunType(batchType, scheme, summer)

        expect(result).to.equal('Annual')
      })
    })

    describe('when the batch type is "supplementary"', () => {
      beforeEach(() => {
        batchType = 'supplementary'
      })

      it('returns "Supplementary"', () => {
        const result = BasePresenter.formatBillRunType(batchType, scheme, summer)

        expect(result).to.equal('Supplementary')
      })
    })

    describe('when the batch type is "two_part_supplementary"', () => {
      beforeEach(() => {
        batchType = 'two_part_supplementary'
      })

      it('returns "Two-part tariff supplementary"', () => {
        const result = BasePresenter.formatBillRunType(batchType, scheme, summer)

        expect(result).to.equal('Two-part tariff supplementary')
      })
    })

    describe('when the batch type is "two_part_tariff"', () => {
      beforeEach(() => {
        batchType = 'two_part_tariff'
      })

      describe('and the scheme is "sroc"', () => {
        beforeEach(() => {
          scheme = 'sroc'
        })

        it('returns "Two-part tariff"', () => {
          const result = BasePresenter.formatBillRunType(batchType, scheme, summer)

          expect(result).to.equal('Two-part tariff')
        })
      })

      describe('and the scheme is "alcs"', () => {
        beforeEach(() => {
          scheme = 'alcs'
        })

        describe('and it is not summer only', () => {
          beforeEach(() => {
            summer = false
          })

          it('returns "Two-part tariff winter and all year"', () => {
            const result = BasePresenter.formatBillRunType(batchType, scheme, summer)

            expect(result).to.equal('Two-part tariff winter and all year')
          })
        })

        describe('and it is for summer only', () => {
          beforeEach(() => {
            summer = true
          })

          it('returns "Two-part tariff summer"', () => {
            const result = BasePresenter.formatBillRunType(batchType, scheme, summer)

            expect(result).to.equal('Two-part tariff summer')
          })
        })
      })
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
      ].map((date) => {
        return BasePresenter.formatChargingModuleDate(date)
      })

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

  describe('#formatChargeScheme()', () => {
    let scheme

    describe('when the scheme is "sroc"', () => {
      beforeEach(() => {
        scheme = 'sroc'
      })

      it('returns "Current"', () => {
        const result = BasePresenter.formatChargeScheme(scheme)

        expect(result).to.equal('Current')
      })
    })

    describe('when the scheme is "alcs"', () => {
      beforeEach(() => {
        scheme = 'alcs'
      })

      it('returns "Old"', () => {
        const result = BasePresenter.formatChargeScheme(scheme)

        expect(result).to.equal('Old')
      })
    })
  })

  describe('#formatFinancialYear()', () => {
    let financialYearEnding

    describe('when the financial year ending is "2024"', () => {
      beforeEach(() => {
        financialYearEnding = 2024
      })

      it('returns "2023 to 2024"', () => {
        const result = BasePresenter.formatFinancialYear(financialYearEnding)

        expect(result).to.equal('2023 to 2024')
      })
    })
  })

  describe('#formatLongDate()', () => {
    it('correctly formats the given date, for example, 12 September 2021', async () => {
      const result = BasePresenter.formatLongDate(new Date('2021-09-12T14:41:10.511Z'))

      expect(result).to.equal('12 September 2021')
    })
  })

  describe('#formatLongDateTime()', () => {
    it('correctly formats the given date, for example, 12 September 2021 at 14:41:10', async () => {
      const result = BasePresenter.formatLongDateTime(new Date('2021-09-12T14:41:10.511Z'))

      expect(result).to.equal('12 September 2021 at 14:41:10')
    })
  })

  describe('#formatPounds()', () => {
    const valueInPence = 114950

    it('correctly returns the value as pounds, for example, 1149.50', async () => {
      const result = BasePresenter.formatPounds(valueInPence)

      expect(result).to.equal('1149.50')
    })
  })

  describe('#formatMoney()', () => {
    let valueInPence

    describe('when the value in pence is positive', () => {
      beforeEach(() => {
        valueInPence = 114950
      })

      it('correctly returns the value as a money string with commas and a symbol, for example, £1,149.50', async () => {
        const result = BasePresenter.formatMoney(valueInPence)

        expect(result).to.equal('£1,149.50')
      })
    })

    describe('when the value in pence is negative', () => {
      beforeEach(() => {
        valueInPence = -114950
      })

      describe('and we do not override the default parameter "signed"', () => {
        it('correctly returns the value as a positive money string with commas and a symbol, for example, £1,149.50', async () => {
          const result = BasePresenter.formatMoney(valueInPence)

          expect(result).to.equal('£1,149.50')
        })
      })

      describe('and we override the default parameter "signed"', () => {
        it('correctly returns the value as a positive money string with commas and a symbol, for example, -£1,149.50', async () => {
          const result = BasePresenter.formatMoney(valueInPence, true)

          expect(result).to.equal('-£1,149.50')
        })
      })
    })
  })

  describe('#leftPadZeroes()', () => {
    it('correctly pads numbers', async () => {
      const number = 123
      const result = BasePresenter.leftPadZeroes(number, 7)

      expect(result).to.equal('0000123')
    })
  })

  describe('#sentenceCase()', () => {
    let valueToSentenceCase

    describe('when the value is a single word', () => {
      beforeEach(() => {
        valueToSentenceCase = 'high'
      })

      it('correctly returns the value in sentence case, for example, High', async () => {
        const result = BasePresenter.sentenceCase(valueToSentenceCase)

        expect(result).to.equal('High')
      })
    })

    describe('when the value is multiple words', () => {
      beforeEach(() => {
        valueToSentenceCase = 'spray irrigation'
      })

      it('correctly returns the value in sentence case, for example, Spray irrigation', async () => {
        const result = BasePresenter.sentenceCase(valueToSentenceCase)

        expect(result).to.equal('Spray irrigation')
      })
    })

    describe('when the value contains a symbol', () => {
      beforeEach(() => {
        valueToSentenceCase = 'spray irrigation - direct'
      })

      it('correctly returns the value in sentence case, for example, Spray irrigation - direct', async () => {
        const result = BasePresenter.sentenceCase(valueToSentenceCase)

        expect(result).to.equal('Spray irrigation - direct')
      })
    })

    describe('when the value is all capitals', () => {
      beforeEach(() => {
        valueToSentenceCase = 'SPRAY IRRIGATION'
      })

      it('correctly returns the value in sentence case, for example, Spray irrigation', async () => {
        const result = BasePresenter.sentenceCase(valueToSentenceCase)

        expect(result).to.equal('Spray irrigation')
      })
    })
  })

  describe('#titleCase()', () => {
    let valueToTitleCase

    describe('when the value is a single word', () => {
      beforeEach(() => {
        valueToTitleCase = 'high'
      })

      it('correctly returns the value in title case, for example, High', async () => {
        const result = BasePresenter.titleCase(valueToTitleCase)

        expect(result).to.equal('High')
      })
    })

    describe('when the value is multiple words', () => {
      beforeEach(() => {
        valueToTitleCase = 'spray irrigation'
      })

      it('correctly returns the value in title case, for example, Spray Irrigation', async () => {
        const result = BasePresenter.titleCase(valueToTitleCase)

        expect(result).to.equal('Spray Irrigation')
      })
    })

    describe('when the value contains a symbol', () => {
      beforeEach(() => {
        valueToTitleCase = 'spray irrigation - direct'
      })

      it('correctly returns the value in title case, for example, Spray Irrigation - Direct', async () => {
        const result = BasePresenter.titleCase(valueToTitleCase)

        expect(result).to.equal('Spray Irrigation - Direct')
      })
    })

    describe('when the value is all capitals', () => {
      beforeEach(() => {
        valueToTitleCase = 'SPRAY IRRIGATION'
      })

      it('correctly returns the value unchanged, for example, SPRAY IRRIGATION', async () => {
        const result = BasePresenter.titleCase(valueToTitleCase)

        expect(result).to.equal('SPRAY IRRIGATION')
      })
    })
  })
})
