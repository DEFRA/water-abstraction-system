'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { ValidationError } = require('joi')
const { today } = require('../../app/lib/general.lib.js')
const { tomorrow, yesterday } = require('../support/general.js')

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
      it('returns null', async () => {
        const result = BasePresenter.formatAbstractionPeriod(startDay, startMonth, endDay, endMonth)

        expect(result).to.be.null()
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
    describe('when a valid "Date" is provided', () => {
      it('correctly formats the given date, for example, 12 September 2021', async () => {
        const result = BasePresenter.formatLongDate(new Date('2021-09-12T14:41:10.511Z'))

        expect(result).to.equal('12 September 2021')
      })
    })

    describe('when a valid "String" date is provided', () => {
      it('correctly formats the given date, for example, 12 September 2021', async () => {
        const result = BasePresenter.formatLongDate('2021-09-12')

        expect(result).to.equal('12 September 2021')
      })
    })

    describe('when an invalid "Date" is provided', () => {
      it('correctly returns invalid date', async () => {
        const result = BasePresenter.formatLongDate(new Date('2021-09-50'))

        expect(result).to.equal('Invalid Date')
      })
    })

    describe('when an invalid "String" date is provided', () => {
      it('correctly returns invalid date', async () => {
        const result = BasePresenter.formatLongDate('2021-09-50')

        expect(result).to.equal('Invalid Date')
      })
    })

    describe('when a falsey value date is provided', () => {
      it('correctly returns null', async () => {
        const result = BasePresenter.formatLongDate(undefined)

        expect(result).to.be.null()
      })
    })
  })

  describe('#formatLongDateTime()', () => {
    it('correctly formats the given date, for example, 12 September 2021 at 14:41:10', async () => {
      const result = BasePresenter.formatLongDateTime(new Date('2021-09-12T14:41:10.511Z'))

      expect(result).to.equal('12 September 2021 at 14:41:10')
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

  describe('#formatNumber()', () => {
    it('formats a number for display', () => {
      const result = BasePresenter.formatNumber(12345.6789)

      expect(result).to.equal('12,345.679')
    })
  })

  describe('#formatPounds()', () => {
    const valueInPence = 114950

    it('correctly returns the value as pounds, for example, 1149.50', async () => {
      const result = BasePresenter.formatPounds(valueInPence)

      expect(result).to.equal('1149.50')
    })
  })

  describe('#formatPurposes()', () => {
    let purposes

    describe('when there is a single purpose', () => {
      beforeEach(() => {
        purposes = [{ tertiary: { description: 'Spray Irrigation - Direct' } }]
      })

      it('returns the purpose description', () => {
        const result = BasePresenter.formatPurposes(purposes)

        expect(result).to.equal(['Spray Irrigation - Direct'])
      })
    })

    describe('when there is a single purpose with an alias', () => {
      beforeEach(() => {
        purposes = [{ alias: 'This is an alias', tertiary: { description: 'Spray Irrigation - Direct' } }]
      })

      it('returns the purpose description', () => {
        const result = BasePresenter.formatPurposes(purposes)

        expect(result).to.equal(['Spray Irrigation - Direct (This is an alias)'])
      })
    })

    describe('when there is more than one purpose', () => {
      beforeEach(() => {
        purposes = [
          { tertiary: { description: 'Spray Irrigation - Direct' } },
          { tertiary: { description: 'Spray Irrigation - Anti Frost' } },
          { tertiary: { description: 'Spray Irrigation - Storage' } }
        ]
      })

      it('returns the purpose descriptions as a comma separated string', () => {
        const result = BasePresenter.formatPurposes(purposes)

        expect(result).to.equal([
          'Spray Irrigation - Direct',
          'Spray Irrigation - Anti Frost',
          'Spray Irrigation - Storage'
        ])
      })
    })

    describe('when there is more than one purpose with some having aliases', () => {
      beforeEach(() => {
        purposes = [
          { alias: 'This is an alias', tertiary: { description: 'Spray Irrigation - Direct' } },
          { tertiary: { description: 'Spray Irrigation - Anti Frost' } },
          { tertiary: { description: 'Spray Irrigation - Storage' } }
        ]
      })

      it('returns the purpose descriptions as a comma separated string', () => {
        const result = BasePresenter.formatPurposes(purposes)

        expect(result).to.equal([
          'Spray Irrigation - Direct (This is an alias)',
          'Spray Irrigation - Anti Frost',
          'Spray Irrigation - Storage'
        ])
      })
    })
  })

  describe('#formatQuantity()', () => {
    describe('when quantity and units are provided', () => {
      describe('and the value is not 0', () => {
        it('returns converted and formatted quantity', () => {
          const result = BasePresenter.formatQuantity('gal', 100)

          expect(result).to.equal('21,996.925')
        })
      })

      describe('and the value is 0', () => {
        it('returns 0 as a string', () => {
          const result = BasePresenter.formatQuantity('gal', 0)

          expect(result).to.equal('0')
        })
      })
    })

    describe('when quantity is null', () => {
      it('returns null', () => {
        const result = BasePresenter.formatQuantity('someUnit', null)

        expect(result).to.equal(null)
      })
    })
  })

  describe('#formatRestrictionType', () => {
    describe('when the "RestrictionType" is "stop_or_reduce"', () => {
      it('returns the restriction type in sentence case', () => {
        const result = BasePresenter.formatRestrictionType('stop_or_reduce')

        expect(result).to.equal('Stop or reduce')
      })
    })

    describe('when the "RestrictionType" is not "stop_or_reduce"', () => {
      it('returns the restriction type in sentence case', () => {
        const result = BasePresenter.formatRestrictionType('stop')

        expect(result).to.equal('Stop')
      })
    })
  })

  describe('#formatReturnLogStatus()', () => {
    let testReturnLog

    describe('when status is "due"', () => {
      describe('and the end date is greater than or equal to the current date', () => {
        before(() => {
          testReturnLog = { endDate: today(), status: 'due' }
        })

        it('returns "not due yet"', () => {
          const result = BasePresenter.formatReturnLogStatus(testReturnLog)

          expect(result).to.equal('not due yet')
        })
      })

      describe('and the end date is less than the current date', () => {
        before(() => {
          testReturnLog = { endDate: yesterday(), status: 'due' }
        })

        describe('and the due date is null', () => {
          before(() => {
            testReturnLog.dueDate = null
          })

          it('returns "open"', () => {
            const result = BasePresenter.formatReturnLogStatus(testReturnLog)

            expect(result).to.equal('open')
          })
        })

        describe('and the due date is more than 28 days in the future', () => {
          before(() => {
            const inFuture = today()

            inFuture.setDate(inFuture.getDate() + 29)

            testReturnLog = { dueDate: inFuture, status: 'due' }
          })

          it('returns "open"', () => {
            const result = BasePresenter.formatReturnLogStatus(testReturnLog)

            expect(result).to.equal('open')
          })
        })

        describe('and the due date is in the next 28 days', () => {
          before(() => {
            testReturnLog = { dueDate: tomorrow(), status: 'due' }
          })

          it('returns "due"', () => {
            const result = BasePresenter.formatReturnLogStatus(testReturnLog)

            expect(result).to.equal('due')
          })
        })

        describe('and the due date is equal to the current date', () => {
          before(() => {
            testReturnLog = { dueDate: today(), status: 'due' }
          })

          it('returns "due"', () => {
            const result = BasePresenter.formatReturnLogStatus(testReturnLog)

            expect(result).to.equal('due')
          })
        })

        describe('and the due date is less than the current date', () => {
          before(() => {
            testReturnLog = { dueDate: yesterday(), status: 'due' }
          })

          it('returns "overdue"', () => {
            const result = BasePresenter.formatReturnLogStatus(testReturnLog)

            expect(result).to.equal('overdue')
          })
        })
      })
    })

    describe('when status is "received"', () => {
      before(() => {
        testReturnLog = { dueDate: null, status: 'received' }
      })

      it('returns "received"', () => {
        const result = BasePresenter.formatReturnLogStatus(testReturnLog)

        expect(result).to.equal('received')
      })
    })

    describe('when status is "completed"', () => {
      before(() => {
        testReturnLog = { dueDate: null, status: 'completed' }
      })

      it('returns "complete"', () => {
        const result = BasePresenter.formatReturnLogStatus(testReturnLog)

        expect(result).to.equal('complete')
      })
    })

    describe('when status is "void"', () => {
      before(() => {
        testReturnLog = { dueDate: null, status: 'void' }
      })

      it('returns "void"', () => {
        const result = BasePresenter.formatReturnLogStatus(testReturnLog)

        expect(result).to.equal('void')
      })
    })
  })

  describe('#formatValidationResult()', () => {
    let validationResult

    describe('when the validation result has no errors', () => {
      beforeEach(() => {
        validationResult = {
          value: {
            noticeTypes: ['returnReminder', 'returnInvitation'],
            reference: 'RREM-VB9EFA',
            sentFromDay: '01',
            sentFromMonth: '09',
            sentFromYear: '2025',
            fromDate: new Date('2025-09-01'),
            toDate: undefined
          }
        }
      })

      it('returns null', () => {
        const result = BasePresenter.formatValidationResult(validationResult)

        expect(result).to.be.null()
      })
    })

    describe('when the validation result contains a single failure', () => {
      beforeEach(() => {
        const error = new ValidationError('Enter an email address in the correct format, like name@example.com', [
          {
            message: 'Enter an email address in the correct format, like name@example.com',
            path: ['email'],
            type: 'string.email',
            context: {
              value: 'fudge',
              invalids: ['fudge'],
              label: 'email',
              key: 'email'
            }
          }
        ])

        validationResult = {
          value: { type: 'email', email: 'fudge' },
          error
        }
      })

      it('returns the validation result formatted for our view pages', () => {
        const result = BasePresenter.formatValidationResult(validationResult)

        expect(result).to.equal({
          errorList: [
            {
              href: '#email',
              text: 'Enter an email address in the correct format, like name@example.com'
            }
          ],
          email: {
            text: 'Enter an email address in the correct format, like name@example.com'
          }
        })
      })
    })

    describe('when the validation result contains multiple failures', () => {
      beforeEach(() => {
        const error = new ValidationError(
          'Enter a valid from date. Reference must be 11 characters or less. Enter a valid to date',
          [
            {
              message: 'Enter a valid from date',
              path: ['fromDate'],
              type: 'date.format',
              context: {
                format: ['YYYY-MM-DD'],
                label: 'fromDate',
                value: '--01',
                key: 'fromDate'
              }
            },
            {
              message: 'Reference must be 11 characters or less',
              path: ['reference'],
              type: 'string.max',
              context: {
                limit: 11,
                value: 'jkdfshfhkfhsdjkfsdjkfghadshj',
                encoding: undefined,
                label: 'reference',
                key: 'reference'
              }
            },
            {
              message: 'Enter a valid to date',
              path: ['toDate'],
              type: 'date.format',
              context: {
                format: ['YYYY-MM-DD'],
                label: 'toDate',
                value: '-04-',
                key: 'toDate'
              }
            }
          ]
        )

        validationResult = {
          value: {
            reference: 'jkdfshfhkfhsdjkfsdjkfghadshj',
            sentFromDay: '01',
            sentToMonth: '04',
            noticeTypes: [],
            fromDate: '--01',
            toDate: '-04-'
          },
          error
        }
      })

      it('returns the validation result formatted for our view pages', () => {
        const result = BasePresenter.formatValidationResult(validationResult)

        expect(result).to.equal({
          errorList: [
            { href: '#fromDate', text: 'Enter a valid from date' },
            {
              href: '#reference',
              text: 'Reference must be 11 characters or less'
            },
            { href: '#toDate', text: 'Enter a valid to date' }
          ],
          fromDate: { text: 'Enter a valid from date' },
          reference: { text: 'Reference must be 11 characters or less' },
          toDate: { text: 'Enter a valid to date' }
        })
      })
    })

    describe('when the validation result contains multiple failures for the same field', () => {
      beforeEach(() => {
        const error = new ValidationError(
          'Enter a valid from date. Reference must be 11 characters or less. Enter a valid to date',
          [
            {
              message: 'Reference must be 11 characters or less',
              path: ['reference'],
              type: 'string.max',
              context: {
                limit: 11,
                value: 'jkdfshfhkfhsdjkfsdjkfghadshj',
                encoding: undefined,
                label: 'reference',
                key: 'reference'
              }
            },
            {
              message: 'Reference must be more then 1 character',
              path: ['reference'],
              type: 'string.max',
              context: {
                limit: 11,
                value: '1',
                encoding: undefined,
                label: 'reference',
                key: 'reference'
              }
            }
          ]
        )

        validationResult = {
          value: {
            reference: 'jkdfshfhkfhsdjkfsdjkfghadshj',
            sentFromDay: '01',
            sentToMonth: '04',
            noticeTypes: [],
            fromDate: '--01',
            toDate: '-04-'
          },
          error
        }
      })

      it('returns the validation result formatted for our view pages', () => {
        const result = BasePresenter.formatValidationResult(validationResult)

        expect(result).to.equal({
          errorList: [
            {
              href: '#reference',
              text: 'Reference must be 11 characters or less'
            }
          ],
          reference: { text: 'Reference must be 11 characters or less' }
        })
      })
    })
  })

  describe('#formatValueUnit()', () => {
    it('correctly formats the given value and unit, for example, 100 and Ml/d is formatted as 100Ml/d', () => {
      const result = BasePresenter.formatValueUnit(100, 'Ml/d')

      expect(result).to.equal('100Ml/d')
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

    describe('when the value has a mix of capitals and lower case', () => {
      beforeEach(() => {
        valueToTitleCase = 'sPrAy iRRIGATION'
      })

      it('correctly returns the value in title case', async () => {
        const result = BasePresenter.titleCase(valueToTitleCase)

        expect(result).to.equal('Spray Irrigation')
      })
    })

    describe('when the value has text in brackets', () => {
      beforeEach(() => {
        valueToTitleCase = '(text in brackets)'
      })

      it('correctly returns the value in title case', async () => {
        const result = BasePresenter.titleCase(valueToTitleCase)

        expect(result).to.equal('(Text In Brackets)')
      })
    })
  })
})
