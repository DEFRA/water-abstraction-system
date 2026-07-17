// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import StartDateValidator from '../../../../app/validators/return-versions/setup/start-date.validator.js'

describe('Return Versions Setup - Start Date validator', () => {
  const licenceEndDate = '2023-12-31T00:00:00.000Z'
  const licenceStartDate = '2023-01-01T00:00:00.000Z'

  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the licence version start date option', () => {
      beforeEach(() => {
        payload = {
          startDateOptions: 'licenceStartDate'
        }
      })

      it('confirms the payload is valid', () => {
        const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

        expect(result.error).toBeUndefined()
      })
    })

    describe('because the user entered a valid other date', () => {
      beforeEach(() => {
        payload = {
          startDateOptions: 'anotherStartDate',
          startDateDay: '26',
          startDateMonth: '11',
          startDateYear: '2023'
        }
      })

      it('confirms the payload is valid', () => {
        const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select the start date for the requirements for returns"', () => {
        const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the start date for the requirements for returns')
      })
    })

    describe('because the user selected "Another date"', () => {
      beforeEach(() => {
        payload = { startDateOptions: 'anotherStartDate' }
      })

      describe('but then entered no values', () => {
        beforeEach(() => {
          payload.startDateDay = null
          payload.startDateMonth = null
          payload.startDateYear = null
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Enter a real start date')
        })
      })

      describe('but only entered some values', () => {
        beforeEach(() => {
          payload.startDateDay = '6'
          payload.startDateMonth = '4'
          payload.startDateYear = null
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Enter a real start date')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload.startDateDay = 'TT'
          payload.startDateMonth = 'ZZ'
          payload.startDateYear = 'LLLL'
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Enter a real start date')
        })
      })

      describe('but entered invalid numbers, for example, 13 for the month', () => {
        beforeEach(() => {
          payload.startDateDay = '6'
          payload.startDateMonth = '13'
          payload.startDateYear = '2023'
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Enter a real start date')
        })
      })

      describe('but entered an invalid date, for example, 2023-02-29', () => {
        beforeEach(() => {
          payload.startDateDay = '29'
          payload.startDateMonth = '2'
          payload.startDateYear = '2023'
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Enter a real start date')
        })
      })

      describe("but entered a date before the licence's effective start date", () => {
        beforeEach(() => {
          payload.startDateDay = '31'
          payload.startDateMonth = '12'
          payload.startDateYear = '2022'
        })

        it('fails validation with the message "Start date must be on or after the original licence start date"', () => {
          const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual(
            'Start date must be on or after the original licence start date'
          )
        })
      })

      describe('but entered a date before the first return cycle start date', () => {
        beforeEach(() => {
          payload.startDateDay = '31'
          payload.startDateMonth = '12'
          payload.startDateYear = '1958'
        })

        it('fails validation with the message "Start date must be on or after 1 April 1959"', () => {
          const result = StartDateValidator(payload, '1958-01-01T00:00:00.000Z', licenceEndDate)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Start date must be on or after 1 April 1959')
        })
      })

      describe("but entered a date after the licence's end date", () => {
        beforeEach(() => {
          payload.startDateDay = '1'
          payload.startDateMonth = '1'
          payload.startDateYear = '2024'
        })

        it('fails validation with the message "Start date must be before the licence end date"', () => {
          const result = StartDateValidator(payload, licenceStartDate, licenceEndDate)

          expect(result.error).toBeDefined()
          expect(result.error.details[0].message).toEqual('Start date must be before the licence end date')
        })
      })
    })
  })
})
