'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StartReadingValidator = require('../../../../app/validators/return-logs/setup/start-reading.validator.js')

describe('Return Logs Setup - Start Reading validator', () => {
  let payload
  let lines

  beforeEach(() => {
    lines = [
      {
        endDate: '2019-04-30T00:00:00.000Z',
        startDate: '2019-04-01T00:00:00.000Z'
      },
      {
        endDate: '2019-05-31T00:00:00.000Z',
        startDate: '2019-05-01T00:00:00.000Z'
      }
    ]
  })

  describe('when a valid payload is provided', () => {
    describe('because the user entered a value', () => {
      describe('and the return lines do not have any readings', () => {
        beforeEach(() => {
          payload = { startReading: '156000' }
        })

        it('confirms the payload is valid', () => {
          const result = StartReadingValidator.go(payload, lines)

          expect(result.error).not.to.exist()
        })
      })

      describe('and the value is 0', () => {
        beforeEach(() => {
          payload = { startReading: '0' }
        })

        it('confirms the payload is valid', () => {
          const result = StartReadingValidator.go(payload, lines)

          expect(result.error).not.to.exist()
        })
      })

      describe('and the return lines do have an initial reading', () => {
        beforeEach(() => {
          payload = { startReading: '156000' }
          lines[0].reading = '160000'
        })

        it('confirms the payload is valid', () => {
          const result = StartReadingValidator.go(payload, lines)

          expect(result.error).not.to.exist()
        })
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not enter anything', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Enter a start meter reading"', () => {
        const result = StartReadingValidator.go(payload, lines)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a start meter reading')
      })
    })

    describe('because the user entered text', () => {
      beforeEach(() => {
        payload = { startReading: 'Test' }
      })

      it('fails validation with the message "Start meter reading must 0 or higher"', () => {
        const result = StartReadingValidator.go(payload, lines)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Start meter reading must 0 or higher')
      })
    })

    describe('because the user entered a negative start reading', () => {
      beforeEach(() => {
        payload = { startReading: '-1' }
      })

      it('fails validation with the message "Start meter reading must not be negative"', () => {
        const result = StartReadingValidator.go(payload, lines)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Start meter reading must not be negative')
      })
    })

    describe('because the user entered a decimal number', () => {
      beforeEach(() => {
        payload = { startReading: '1.1' }
      })

      it('fails validation with the message "Start meter reading must be a whole number"', () => {
        const result = StartReadingValidator.go(payload, lines)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Start meter reading must be a whole number')
      })
    })

    describe('because the return lines have an initial reading', () => {
      describe('and the user entered a number greater than the initial reading', () => {
        beforeEach(() => {
          payload = { startReading: '10010' }
          lines[0].reading = '10000'
        })

        it('fails validation with the message "Please enter a reading which is equal to or lower than the next reading of 10000"', () => {
          const result = StartReadingValidator.go(payload, lines)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal(
            'Please enter a reading which is equal to or lower than the next reading of 10000'
          )
        })
      })
    })

    describe('because the return lines do not have an initial reading', () => {
      describe('and the user entered a number greater than the default maximum allowed reading of 99999999999', () => {
        beforeEach(() => {
          payload = { startReading: '999999999991' }
        })

        it('fails validation with the message "Start meter reading exceeds the maximum of 99999999999"', () => {
          const result = StartReadingValidator.go(payload, lines)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Start meter reading exceeds the maximum of 99999999999')
        })
      })

      describe('and the user entered a number greater than the the maximum safe number 9007199254740991', () => {
        beforeEach(() => {
          payload = { startReading: '9007199254740992' }
        })

        it('fails validation with the message "Start meter reading exceeds the maximum of 99999999999"', () => {
          const result = StartReadingValidator.go(payload, lines)

          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Start meter reading exceeds the maximum of 99999999999')
        })
      })
    })
  })
})
