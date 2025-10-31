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

    describe('because the user selected the "customDates" option', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'customDates',
          periodUsedFromDay: '01',
          periodUsedFromMonth: '04',
          periodUsedFromYear: '2023',
          periodUsedToDay: '31',
          periodUsedToMonth: '03',
          periodUsedToYear: '2024'
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

    describe('because the user selected "customDates" but did not enter anything', () => {
      beforeEach(() => {
        payload = { periodDateUsedOptions: 'customDates' }
      })

      it('fails validation with the message "Enter a valid from date" and "Enter a valid to date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
        expect(result.error.details[1].message).to.equal('Enter a valid from date')
      })
    })

    describe('because the user selected "customDates" and entered an invalid date', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'customDates',
          periodUsedFromDay: '99',
          periodUsedFromMonth: '99',
          periodUsedFromYear: '9999',
          periodUsedToDay: '00',
          periodUsedToMonth: '00',
          periodUsedToYear: '0000'
        }
      })

      it('fails validation with the message "Enter a valid from date" and "Enter a valid to date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
        expect(result.error.details[1].message).to.equal('Enter a valid from date')
      })
    })

    describe('because the user selected "customDates" and entered a text', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'customDates',
          periodUsedFromDay: 'hh',
          periodUsedFromMonth: 'ii',
          periodUsedFromYear: 'abcd',
          periodUsedToDay: 'ab',
          periodUsedToMonth: 'cd',
          periodUsedToYear: 'efgh'
        }
      })

      it('fails validation with the message "Enter a valid from date" and "Enter a valid to date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a valid to date')
        expect(result.error.details[1].message).to.equal('Enter a valid from date')
      })
    })

    describe('because the user selected "customDates" and entered a date outside the return period', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'customDates',
          periodUsedFromDay: '01',
          periodUsedFromMonth: '04',
          periodUsedFromYear: '2024',
          periodUsedToDay: '31',
          periodUsedToMonth: '03',
          periodUsedToYear: '2025'
        }
      })

      it('fails validation with the message "The to date must be within the return periods end date"', () => {
        const result = PeriodUsedValidator.go(payload, startDate, endDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('The to date must be within the return periods end date')
      })
    })

    describe('because the user selected "customDates" and entered the to and from date the wrong way round', () => {
      beforeEach(() => {
        payload = {
          periodDateUsedOptions: 'customDates',
          periodUsedFromDay: '31',
          periodUsedFromMonth: '03',
          periodUsedFromYear: '2024',
          periodUsedToDay: '01',
          periodUsedToMonth: '03',
          periodUsedToYear: '2023'
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
