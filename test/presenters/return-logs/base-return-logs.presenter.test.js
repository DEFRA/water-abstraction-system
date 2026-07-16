// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { unitNames } from '../../../app/lib/static-lookups.lib.js'

// Thing under test
import * as BaseReturnLogsPresenter from '../../../app/presenters/return-logs/base-return-logs.presenter.js'

describe('Return Logs - Base Return Logs presenter', () => {
  describe('#formatMeterDetails()', () => {
    const testMeter = {
      manufacturer: 'METER_MAKE',
      multiplier: 1,
      serialNumber: 'METER_SERIAL_NUMBER'
    }

    it('returns the expected details', () => {
      const result = BaseReturnLogsPresenter.formatMeterDetails(testMeter)

      expect(result).toEqual({
        make: 'METER_MAKE',
        serialNumber: 'METER_SERIAL_NUMBER',
        xDisplay: 'No'
      })
    })

    describe('when the multiplier is 10', () => {
      it('returns Yes for the xDisplay property', () => {
        const result = BaseReturnLogsPresenter.formatMeterDetails({ ...testMeter, multiplier: 10 })

        expect(result.xDisplay).toEqual('Yes')
      })
    })

    describe('when no meter is provided', () => {
      it('returns null', () => {
        const result = BaseReturnLogsPresenter.formatMeterDetails(null)

        expect(result).toEqual(null)
      })
    })

    describe('when no manufacturer is provided', () => {
      it('returns null', () => {
        const result = BaseReturnLogsPresenter.formatMeterDetails({ ...testMeter, manufacturer: null })

        expect(result).toEqual(null)
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

        expect(result).not.toContainEqual({ text: 'Reading', format: 'numeric' })
        expect(result).not.toContainEqual({ text: 'End reading', format: 'numeric' })
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

          expect(result).toContainEqual({ text: 'Reading', format: 'numeric' })
        })
      })

      describe('and the frequency is not month', () => {
        it('includes an End reading column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'NOT_ABSTRACTION_VOLUMES',
            'NOT_MONTH',
            unitNames.CUBIC_METRES
          )

          expect(result).toContainEqual({ text: 'End reading', format: 'numeric' })
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

          expect(result).toContainEqual({ text: 'Gallons', format: 'numeric' })
        })
      })

      describe('and the frequency is not month', () => {
        it('includes a converted total quantity column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'abstractionVolumes',
            'NOT_MONTH',
            unitNames.GALLONS
          )

          expect(result).toContainEqual({ text: 'Total gallons', format: 'numeric' })
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

          expect(result).toContainEqual({ text: 'Total cubic metres', format: 'numeric' })
        })
      })

      describe('when the frequency is month', () => {
        it('specifies the non-totalled cubic metres', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
            'abstractionVolumes',
            'month',
            unitNames.CUBIC_METRES
          )

          expect(result).toContainEqual({ text: 'Cubic metres', format: 'numeric' })
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

        expect(result).toContainEqual({ text: 'Details', format: 'numeric' })
      })

      it('is not present when the frequency is month', () => {
        const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
          'abstractionVolumes',
          'month',
          unitNames.CUBIC_METRES
        )

        expect(result).not.toContainEqual({ text: 'Details', format: 'numeric' })
      })

      it('is present when the frequency is month and "alwaysDisplayLinkHeader" is true', () => {
        const result = BaseReturnLogsPresenter.generateSummaryTableHeaders(
          'abstractionVolumes',
          'month',
          unitNames.CUBIC_METRES,
          true
        )

        expect(result).toContainEqual({ text: 'Details', format: 'numeric' })
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

          expect(result[0].month).toEqual('January 2023')
          expect(result[1].month).toEqual('February 2023')
        })

        it('returns the monthlyTotal as a formatted string', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].monthlyTotal).toEqual('400')
          expect(result[1].monthlyTotal).toEqual('500')
        })

        it('does not include a "reading" column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].reading).toBeUndefined()
          expect(result[1].reading).toBeUndefined()
        })

        it('does not include a "link" object', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].link).toBeUndefined()
          expect(result[1].link).toBeUndefined()
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

            expect(result[0].unitTotal).toEqual('87,987.69932')
            expect(result[1].unitTotal).toEqual('109,984.62415')
          })
        })

        describe('and the lines being processed contain a null "quantity"', () => {
          beforeEach(() => {
            sampleLines[1].quantity = null
          })

          it('still returns the monthlyTotal as null for the line with a null "quantity"', () => {
            const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

            expect(result[0].monthlyTotal).toEqual('400')
            expect(result[1].monthlyTotal).toBeNull()
          })
        })

        describe('and all the lines being processed contain a null "quantity"', () => {
          beforeEach(() => {
            sampleLines.forEach((sampleLine) => {
              sampleLine.quantity = null
            })
          })

          it('returns the monthlyTotal as null for all lines', () => {
            const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

            expect(result[0].monthlyTotal).toBeNull()
            expect(result[1].monthlyTotal).toBeNull()
          })
        })

        describe('and the lines being processed contain zero "quantity"', () => {
          beforeEach(() => {
            sampleLines[1].quantity = 0
          })

          it('returns the monthlyTotal as 0 for the line with a zero "quantity"', () => {
            const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

            expect(result[0].monthlyTotal).toEqual('400')
            expect(result[1].monthlyTotal).toEqual('0')
          })
        })

        describe('and all the lines being processed contain a zero "quantity"', () => {
          beforeEach(() => {
            sampleLines.forEach((sampleLine) => {
              sampleLine.quantity = 0
            })
          })

          it('returns the monthlyTotal as 0 for all lines', () => {
            const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

            expect(result[0].monthlyTotal).toEqual('0')
            expect(result[1].monthlyTotal).toEqual('0')
          })
        })
      })

      describe('and the abstraction method is not "abstractionVolumes"', () => {
        beforeEach(() => {
          method = 'readings'
        })

        it('includes a reading column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].reading).toEqual(111)
          expect(result[1].reading).toEqual(222)
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

          expect(result[0].month).toEqual('January 2023')
        })

        it('returns the monthlyTotal as a formatted string', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].monthlyTotal).toEqual('1,500')
        })

        it('does not include a "reading" column', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].reading).toBeUndefined()
        })

        it('includes a "link" object', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines, id)

          expect(result[0].link.href).toEqual('/system/return-submissions/e3cb54dc-f895-4918-bab7-0819fd870a1f/2023-0')
          expect(result[0].link.text).toEqual('View daily volumes')
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

            expect(result[0].unitTotal).toEqual('329,953.872449')
          })
        })

        describe('and the lines being processed contain a null "quantity"', () => {
          beforeEach(() => {
            sampleLines[1].quantity = null
          })

          it('still returns the monthlyTotal as a formatted string', () => {
            const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

            expect(result[0].monthlyTotal).toEqual('1,000')
          })
        })

        describe('and all the lines being processed contain a null "quantity"', () => {
          beforeEach(() => {
            sampleLines.forEach((sampleLine) => {
              sampleLine.quantity = null
            })
          })

          it('returns the monthlyTotal as null', () => {
            const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

            expect(result[0].monthlyTotal).toBeNull()
          })
        })
      })

      describe('and the abstraction method is not "abstractionVolumes"', () => {
        beforeEach(() => {
          method = 'readings'
        })

        it('includes a "reading" column which is the last non-null meter reading', () => {
          const result = BaseReturnLogsPresenter.generateSummaryTableRows(method, frequency, sampleLines)

          expect(result[0].reading).toEqual(222)
        })
      })
    })
  })
})
