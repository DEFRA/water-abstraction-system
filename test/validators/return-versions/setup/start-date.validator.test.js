'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const StartDateValidator = require('../../../../app/validators/return-versions/setup/start-date.validator.js')

describe('Return Versions Setup - Start Date validator', () => {
  const licenceEndDate = '2023-12-31T00:00:00.000Z'
  const licenceStartDate = '2023-01-01T00:00:00.000Z'

  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the licence version start date option', () => {
      beforeEach(() => {
        payload = {
          'start-date-options': 'licenceStartDate'
        }
      })

      it('confirms the payload is valid', () => {
        const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user entered a valid other date', () => {
      beforeEach(() => {
        payload = {
          'start-date-options': 'anotherStartDate',
          'start-date-day': '26',
          'start-date-month': '11',
          'start-date-year': '2023'
        }
      })

      it('confirms the payload is valid', () => {
        const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select the start date for the requirements for returns"', () => {
        const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the start date for the requirements for returns')
      })
    })

    describe('because the user selected "Another date"', () => {
      beforeEach(() => {
        payload = { 'start-date-options': 'anotherStartDate' }
      })

      describe('but then entered no values', () => {
        beforeEach(() => {
          payload['start-date-day'] = null
          payload['start-date-month'] = null
          payload['start-date-year'] = null
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real start date')
        })
      })

      describe('but only entered some values', () => {
        beforeEach(() => {
          payload['start-date-day'] = '6'
          payload['start-date-month'] = '4'
          payload['start-date-year'] = null
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real start date')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload['start-date-day'] = 'TT'
          payload['start-date-month'] = 'ZZ'
          payload['start-date-year'] = 'LLLL'
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real start date')
        })
      })

      describe('but entered invalid numbers, for example, 13 for the month', () => {
        beforeEach(() => {
          payload['start-date-day'] = '6'
          payload['start-date-month'] = '13'
          payload['start-date-year'] = '2023'
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real start date')
        })
      })

      describe('but entered an invalid date, for example, 2023-02-29', () => {
        beforeEach(() => {
          payload['start-date-day'] = '29'
          payload['start-date-month'] = '2'
          payload['start-date-year'] = '2023'
        })

        it('fails validation with the message "Enter a real start date"', () => {
          const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real start date')
        })
      })

      describe("but entered a date before the licence's effective start date", () => {
        beforeEach(() => {
          payload['start-date-day'] = '31'
          payload['start-date-month'] = '12'
          payload['start-date-year'] = '2022'
        })

        it('fails validation with the message "Start date must be on or after the original licence start date"', () => {
          const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Start date must be on or after the original licence start date')
        })
      })

      describe("but entered a date after the licence's end date", () => {
        beforeEach(() => {
          payload['start-date-day'] = '1'
          payload['start-date-month'] = '1'
          payload['start-date-year'] = '2024'
        })

        it('fails validation with the message "Start date must be before the licence end date"', () => {
          const result = StartDateValidator.go(payload, licenceStartDate, licenceEndDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Start date must be before the licence end date')
        })
      })
    })
  })
})
