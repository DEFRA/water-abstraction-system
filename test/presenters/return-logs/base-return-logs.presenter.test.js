'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const BaseReturnLogsPresenter = require('../../../app/presenters/return-logs/base-return-logs.presenter.js')

const { unitNames } = require('../../../app/lib/static-lookups.lib.js')

describe('Base Return Logs presenter', () => {
  describe('#convertToCubicMetres()', () => {
    let quantity
    let units

    describe('when the quantity is null or undefined', () => {
      before(() => {
        quantity = null
        units = 'm³'
      })

      it('returns null', () => {
        const result = BaseReturnLogsPresenter.convertToCubicMetres(quantity, units)

        expect(result).to.be.null()
      })
    })

    describe('when the quantity is in cubic metres', () => {
      before(() => {
        quantity = 1000
        units = 'm³'
      })

      it('returns the same quantity formatted as a string', () => {
        const result = BaseReturnLogsPresenter.convertToCubicMetres(quantity, units)

        expect(result).to.equal('1,000')
      })
    })

    describe('when the quantity is in litres', () => {
      before(() => {
        quantity = 1000
        units = 'l'
      })

      it('returns the quantity converted to cubic metres formatted as a string', () => {
        const result = BaseReturnLogsPresenter.convertToCubicMetres(quantity, units)

        expect(result).to.equal('1')
      })
    })

    describe('when the quantity is in megalitres', () => {
      before(() => {
        quantity = 1000
        units = 'Ml'
      })

      it('returns the quantity converted to cubic metres formatted as a string', () => {
        const result = BaseReturnLogsPresenter.convertToCubicMetres(quantity, units)

        expect(result).to.equal('1,000,000')
      })
    })

    describe('when the quantity is in gallons', () => {
      before(() => {
        quantity = 1000
        units = 'gal'
      })

      it('returns the quantity converted to cubic metres formatted as a string to 3 decimal places', () => {
        const result = BaseReturnLogsPresenter.convertToCubicMetres(quantity, units)

        expect(result).to.equal('4.546')
      })
    })
  })

  describe('#formatMeterDetails()', () => {
    const testMeter = {
      manufacturer: 'METER_MAKE',
      multiplier: 1,
      serialNumber: 'METER_SERIAL_NUMBER'
    }

    it('returns the expected details', () => {
      const result = BaseReturnLogsPresenter.formatMeterDetails(testMeter)

      expect(result).to.equal({
        make: 'METER_MAKE',
        serialNumber: 'METER_SERIAL_NUMBER',
        xDisplay: 'No'
      })
    })

    describe('when the multiplier is 10', () => {
      it('returns Yes for the xDisplay property', () => {
        const result = BaseReturnLogsPresenter.formatMeterDetails({ ...testMeter, multiplier: 10 })

        expect(result.xDisplay).to.equal('Yes')
      })
    })

    describe('when no meter is provided', () => {
      it('returns null', () => {
        const result = BaseReturnLogsPresenter.formatMeterDetails(null)

        expect(result).to.equal(null)
      })
    })

    describe('when no manufacturer is provided', () => {
      it('returns null', () => {
        const result = BaseReturnLogsPresenter.formatMeterDetails({ ...testMeter, manufacturer: null })

        expect(result).to.equal(null)
      })
    })
  })

  describe('#formatStatus()', () => {
    const testReturnLog = { dueDate: new Date() }

    describe('when status is completed', () => {
      before(() => {
        testReturnLog.status = 'completed'
      })

      it('returns complete', () => {
        const result = BaseReturnLogsPresenter.formatStatus(testReturnLog)

        expect(result).to.equal('complete')
      })
    })

    describe('when the status is due', () => {
      beforeEach(() => {
        testReturnLog.status = 'due'
      })

      describe('and the due date is in the past', () => {
        before(() => {
          const lastWeek = new Date()
          lastWeek.setDate(lastWeek.getDate() - 7)
          testReturnLog.dueDate = lastWeek
        })

        it('returns overdue', () => {
          const result = BaseReturnLogsPresenter.formatStatus(testReturnLog)

          expect(result).to.equal('overdue')
        })
      })

      describe('and the due date is in the future', () => {
        before(() => {
          const nextWeek = new Date()
          nextWeek.setDate(nextWeek.getDate() + 7)
          testReturnLog.dueDate = nextWeek
        })

        it('returns due', () => {
          const result = BaseReturnLogsPresenter.formatStatus(testReturnLog)

          expect(result).to.equal('due')
        })
      })
    })

    describe('when status is none of these', () => {
      before(() => {
        testReturnLog.status = 'STATUS'
      })

      it('returns the status', () => {
        const result = BaseReturnLogsPresenter.formatStatus(testReturnLog)

        expect(result).to.equal('STATUS')
      })
    })
  })

  describe('#generateSummaryTableHeaders()', () => {
    describe('when the method is abstractionVolumes', () => {
      it('does not include a Reading or End reading column', () => {
        const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
          'abstractionVolumes',
          'month',
          unitNames.CUBIC_METRES
        )

        expect(result).to.not.include({ text: 'Reading', format: 'numeric' })
        expect(result).to.not.include({ text: 'End reading', format: 'numeric' })
      })
    })

    describe('when the method is not abstractionVolumes', () => {
      describe('and the frequency is month', () => {
        it('includes a Reading column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'NOT_ABSTRACTION_VOLUMES',
            'month',
            unitNames.CUBIC_METRES
          )

          expect(result).to.include({ text: 'Reading', format: 'numeric' })
        })
      })

      describe('and the frequency is not month', () => {
        it('includes an End reading column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'NOT_ABSTRACTION_VOLUMES',
            'NOT_MONTH',
            unitNames.CUBIC_METRES
          )

          expect(result).to.include({ text: 'End reading', format: 'numeric' })
        })
      })
    })

    describe('when the unit is not cubic metres', () => {
      describe('and the frequency is month', () => {
        it('includes a converted quantity column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'abstractionVolumes',
            'month',
            unitNames.GALLONS
          )

          expect(result).to.include({ text: 'Gallons', format: 'numeric' })
        })
      })

      describe('and the frequency is not month', () => {
        it('includes a converted total quantity column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'abstractionVolumes',
            'NOT_MONTH',
            unitNames.GALLONS
          )

          expect(result).to.include({ text: 'Total gallons', format: 'numeric' })
        })
      })
    })

    describe('the Cubic metres column', () => {
      describe('when the frequency is not month', () => {
        it('specifies the total cubic metres', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'abstractionVolumes',
            'NOT_MONTH',
            unitNames.CUBIC_METRES
          )

          expect(result).to.include({ text: 'Total cubic metres', format: 'numeric' })
        })
      })

      describe('when the frequency is month', () => {
        it('specifies the non-totalled cubic metres', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'abstractionVolumes',
            'month',
            unitNames.CUBIC_METRES
          )

          expect(result).to.include({ text: 'Cubic metres', format: 'numeric' })
        })
      })
    })

    describe('the Details column', () => {
      it('is present when the frequency is not month', () => {
        const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
          'abstractionVolumes',
          'NOT_MONTH',
          unitNames.CUBIC_METRES
        )

        expect(result).to.include({ text: 'Details', format: 'numeric' })
      })

      it('is not present when the frequency is month', () => {
        const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
          'abstractionVolumes',
          'month',
          unitNames.CUBIC_METRES
        )

        expect(result).to.not.include({ text: 'Details', format: 'numeric' })
      })

      it('is present when the frequency is month and "alwaysDisplayLinkHeader" is true', () => {
        const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
          'abstractionVolumes',
          'month',
          unitNames.CUBIC_METRES,
          true
        )

        expect(result).to.include({ text: 'Details', format: 'numeric' })
      })
    })
  })

  describe('#generateSummaryTableRows()', () => {
    const id = 'e3cb54dc-f895-4918-bab7-0819fd870a1f'

    let frequency
    let method
    let sampleLines

    describe('when the frequency is month', () => {
      beforeEach(() => {
        frequency = 'month'
        sampleLines = [
          {
            endDate: new Date('2023-01-31'),
            quantity: 400,
            reading: 111,
            userUnit: unitNames.CUBIC_METRES
          },
          {
            endDate: new Date('2023-02-28'),
            quantity: 500,
            reading: 222,
            userUnit: unitNames.CUBIC_METRES
          }
        ]
      })

      describe('and the abstraction method is "abstractionVolumes"', () => {
        beforeEach(() => {
          method = 'abstractionVolumes'
        })

        it('returns the month as a formatted string', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].month).to.equal('January 2023')
          expect(result[1].month).to.equal('February 2023')
        })

        it('returns the monthlyTotal as a formatted string', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].monthlyTotal).to.equal('400')
          expect(result[1].monthlyTotal).to.equal('500')
        })

        it('does not include a "reading" column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].reading).to.not.exist()
          expect(result[1].reading).to.not.exist()
        })

        it('does not include a "link" object', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].link).to.not.exist()
          expect(result[1].link).to.not.exist()
        })

        describe('and the "userUnit" is not cubic metres', () => {
          beforeEach(() => {
            sampleLines = [
              {
                endDate: new Date('2023-01-31'),
                quantity: 400,
                reading: 111,
                userUnit: unitNames.GALLONS
              },
              {
                endDate: new Date('2023-02-28'),
                quantity: 500,
                reading: 222,
                userUnit: unitNames.GALLONS
              }
            ]
          })

          it('converts non-cubic metre totals to cubic metres as a formatted string', () => {
            const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

            expect(result[0].unitTotal).to.equal('87,987.699')
            expect(result[1].unitTotal).to.equal('109,984.624')
          })
        })
      })

      describe('and the abstraction method is not "abstractionVolumes"', () => {
        beforeEach(() => {
          method = 'readings'
        })

        it('includes a reading column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].reading).to.equal(111)
          expect(result[1].reading).to.equal(222)
        })
      })
    })

    describe('when the "frequency" is not month', () => {
      beforeEach(() => {
        frequency = 'day'
        sampleLines = [
          {
            endDate: new Date('2023-01-01'),
            quantity: 400,
            reading: 111,
            userUnit: unitNames.CUBIC_METRES
          },
          {
            endDate: new Date('2023-01-02'),
            quantity: 500,
            reading: 222,
            userUnit: unitNames.CUBIC_METRES
          },
          {
            endDate: new Date('2023-01-03'),
            quantity: 600,
            reading: null,
            userUnit: unitNames.CUBIC_METRES
          }
        ]
      })

      describe('and the abstraction method is "abstractionVolumes"', () => {
        beforeEach(() => {
          method = 'abstractionVolumes'
        })

        it('returns the month as a formatted string', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].month).to.equal('January 2023')
        })

        it('returns the monthlyTotal as a formatted string', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].monthlyTotal).to.equal('1,500')
        })

        it('does not include a "reading" column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].reading).to.not.exist()
        })

        it('includes a "link" object', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines, id)

          expect(result[0].link.href).to.equal('/system/return-submissions/e3cb54dc-f895-4918-bab7-0819fd870a1f/2023-0')
          expect(result[0].link.text).to.equal('View daily volumes')
        })

        describe('and the "userUnit" is not cubic metres', () => {
          beforeEach(() => {
            sampleLines = [
              {
                endDate: new Date('2023-01-01'),
                quantity: 400,
                reading: 111,
                userUnit: unitNames.GALLONS
              },
              {
                endDate: new Date('2023-01-02'),
                quantity: 500,
                reading: 222,
                userUnit: unitNames.GALLONS
              },
              {
                endDate: new Date('2023-01-03'),
                quantity: 600,
                reading: null,
                userUnit: unitNames.GALLONS
              }
            ]
          })

          it('converts non-cubic metre totals to cubic metres as a formatted string', () => {
            const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

            expect(result[0].unitTotal).to.equal('329,953.872')
          })
        })
      })

      describe('and the abstraction method is not "abstractionVolumes"', () => {
        beforeEach(() => {
          method = 'readings'
        })

        it('includes a "reading" column which is the last non-null meter reading', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].reading).to.equal(222)
        })
      })
    })
  })
})
