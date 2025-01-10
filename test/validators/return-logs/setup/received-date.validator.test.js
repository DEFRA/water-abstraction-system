'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReceivedDateValidator = require('../../../../app/validators/return-logs/setup/received-date.validator.js')

describe('Return Logs Setup - Received Date validator', () => {
  const returnStartDate = '2023-01-01T00:00:00.000Z'

  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the todays date option', () => {
      beforeEach(() => {
        payload = {
          'received-date-options': 'today'
        }
      })

      it('confirms the payload is valid', () => {
        const result = ReceivedDateValidator.go(payload, returnStartDate)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the yesterdays date option', () => {
      beforeEach(() => {
        payload = {
          'received-date-options': 'yesterday'
        }
      })

      it('confirms the payload is valid', () => {
        const result = ReceivedDateValidator.go(payload, returnStartDate)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user entered a valid custom date', () => {
      beforeEach(() => {
        payload = {
          'received-date-options': 'custom-date',
          'received-date-day': '26',
          'received-date-month': '11',
          'received-date-year': '2023'
        }
      })

      it('confirms the payload is valid', () => {
        const result = ReceivedDateValidator.go(payload, returnStartDate)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select the return received date"', () => {
        const result = ReceivedDateValidator.go(payload, returnStartDate)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the return received date')
      })
    })

    describe('because the user selected "Custom date"', () => {
      beforeEach(() => {
        payload = { 'received-date-options': 'custom-date' }
      })

      describe('but then entered no values', () => {
        beforeEach(() => {
          payload['received-date-day'] = null
          payload['received-date-month'] = null
          payload['received-date-year'] = null
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but only entered some values', () => {
        beforeEach(() => {
          payload['received-date-day'] = '6'
          payload['received-date-month'] = '4'
          payload['received-date-year'] = null
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload['received-date-day'] = 'TT'
          payload['received-date-month'] = 'ZZ'
          payload['received-date-year'] = 'LLLL'
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but entered invalid numbers, for example, 13 for the month', () => {
        beforeEach(() => {
          payload['received-date-day'] = '6'
          payload['received-date-month'] = '13'
          payload['received-date-year'] = '2023'
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but entered an invalid date, for example, 2023-02-29', () => {
        beforeEach(() => {
          payload['received-date-day'] = '29'
          payload['received-date-month'] = '2'
          payload['received-date-year'] = '2023'
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but entered a date before the return logs start date', () => {
        beforeEach(() => {
          payload['received-date-day'] = '31'
          payload['received-date-month'] = '12'
          payload['received-date-year'] = '2022'
        })

        it('fails validation with the message "Received date must be the return period start date or after it"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal(
            'Received date must be the return period start date or after it'
          )
        })
      })

      describe('but entered a future date', () => {
        beforeEach(() => {
          // Get today's date and add 1 day
          const futureDate = new Date()
          futureDate.setDate(futureDate.getDate() + 1) // Set to tomorrow

          // Update the payload with the future date values
          payload['received-date-day'] = String(futureDate.getDate())
          payload['received-date-month'] = String(futureDate.getMonth() + 1) // Month (0-based index)
          payload['received-date-year'] = String(futureDate.getFullYear())
        })

        it('fails validation with the message "Received date must be either todays date or in the past"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal("Received date must be either today's date or in the past")
        })
      })
    })
  })
})
