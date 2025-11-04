'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { today } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ReceivedDateValidator = require('../../../../app/validators/return-logs/setup/received-date.validator.js')

describe('Return Logs Setup - Received Date validator', () => {
  const returnStartDate = '2023-01-01T00:00:00.000Z'

  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the todays date option', () => {
      beforeEach(() => {
        payload = {
          receivedDateOptions: 'today'
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
          receivedDateOptions: 'yesterday'
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
          receivedDateOptions: 'customDate',
          receivedDateDay: '26',
          receivedDateMonth: '11',
          receivedDateYear: '2023'
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
        payload = { receivedDateOptions: 'customDate' }
      })

      describe('but then entered no values', () => {
        beforeEach(() => {
          payload = { receivedDateOptions: 'customDate' }
        })

        it('fails validation with the message "Enter a return received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a return received date')
        })
      })

      describe('but only entered some values', () => {
        beforeEach(() => {
          payload.receivedDateDay = '6'
          payload.receivedDateMonth = '4'
          payload.receivedDateYear = null
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but entered text', () => {
        beforeEach(() => {
          payload.receivedDateDay = 'TT'
          payload.receivedDateMonth = 'ZZ'
          payload.receivedDateYear = 'LLLL'
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but entered invalid numbers, for example, 13 for the month', () => {
        beforeEach(() => {
          payload.receivedDateDay = '6'
          payload.receivedDateMonth = '13'
          payload.receivedDateYear = '2023'
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but entered an invalid date, for example, 2023-02-29', () => {
        beforeEach(() => {
          payload.receivedDateDay = '29'
          payload.receivedDateMonth = '2'
          payload.receivedDateYear = '2023'
        })

        it('fails validation with the message "Enter a real received date"', () => {
          const result = ReceivedDateValidator.go(payload, returnStartDate)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter a real received date')
        })
      })

      describe('but entered a date before the return logs start date', () => {
        beforeEach(() => {
          payload.receivedDateDay = '31'
          payload.receivedDateMonth = '12'
          payload.receivedDateYear = '2022'
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
          const futureDate = today()
          futureDate.setDate(futureDate.getDate() + 1) // Set to tomorrow

          // Update the payload with the future date values
          payload.receivedDateDay = String(futureDate.getDate())
          payload.receivedDateMonth = String(futureDate.getMonth() + 1) // Month (0-based index)
          payload.receivedDateYear = String(futureDate.getFullYear())
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
