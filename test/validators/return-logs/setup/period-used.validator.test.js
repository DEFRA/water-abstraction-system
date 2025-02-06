'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PeriodUsedValidator = require('../../../../app/validators/return-logs/setup/period-used.validator.js')

describe('Return Logs Setup - Period Used validator', () => {
  const startDate = '2023-04-01'
  const endDate = '2024-03-31'

  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the "default" option', () => {
      beforeEach(() => {
        payload = { periodDateUsedOptions: 'default' }
      })

      it('confirms the payload is valid', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the "custom-dates" option', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'custom-dates',
          'period-used-from-day': '01',
          'period-used-from-month': '04',
          'period-used-from-year': '2023',
          'period-used-to-day': '31',
          'period-used-to-month': '03',
          'period-used-to-year': '2024'
        }
      })

      it('confirms the payload is valid', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select what period was used for this volume"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select what period was used for this volume')
      })
    })

    describe('because the user selected "custom-dates" but did not enter anything', () => {
      beforeEach(() => {
        payload = { periodDateUsedOptions: 'custom-dates' }
      })

      it('fails validation with the message "Enter a valid from date" and "Enter a valid to date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid from date')
        expect(result.error.details[1].message).to.equal('Enter a valid to date')
      })
    })

    describe('because the user selected "custom-dates" and entered an invalid date', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'custom-dates',
          'period-used-from-day': '99',
          'period-used-from-month': '99',
          'period-used-from-year': '9999',
          'period-used-to-day': '00',
          'period-used-to-month': '00',
          'period-used-to-year': '0000'
        }
      })

      it('fails validation with the message "Enter a valid from date" and "Enter a valid to date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid from date')
        expect(result.error.details[1].message).to.equal('Enter a valid to date')
      })
    })

    describe('because the user selected "custom-dates" and entered a text', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'custom-dates',
          'period-used-from-day': 'hh',
          'period-used-from-month': 'ii',
          'period-used-from-year': 'abcd',
          'period-used-to-day': 'ab',
          'period-used-to-month': 'cd',
          'period-used-to-year': 'efgh'
        }
      })

      it('fails validation with the message "Enter a valid from date" and "Enter a valid to date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid from date')
        expect(result.error.details[1].message).to.equal('Enter a valid to date')
      })
    })

    describe('because the user selected "custom-dates" and entered a date outside the return period', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'custom-dates',
          'period-used-from-day': '01',
          'period-used-from-month': '04',
          'period-used-from-year': '2024',
          'period-used-to-day': '31',
          'period-used-to-month': '03',
          'period-used-to-year': '2025'
        }
      })

      it('fails validation with the message "The to date must be within the return periods end date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The to date must be within the return periods end date')
      })
    })

    describe('because the user selected "custom-dates" and entered the to and from date the wrong way round', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'custom-dates',
          'period-used-from-day': '31',
          'period-used-from-month': '03',
          'period-used-from-year': '2024',
          'period-used-to-day': '01',
          'period-used-to-month': '03',
          'period-used-to-year': '2023'
        }
      })

      it('fails validation with the message "Enter a valid from date" and "Enter a valid to date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The from date must be before the to date')
      })
    })
  })
})
