'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReadingsValidator = require('../../../../app/validators/return-logs/setup/readings.validator.js')

describe('Return Logs Setup - Readings validator', () => {
  const session = {
    lines: [
      {
        endDate: '2023-04-30T00:00:00.000Z',
        reading: 100,
        startDate: '2023-04-01T00:00:00.000Z'
      },
      {
        endDate: '2023-05-31T00:00:00.000Z',
        startDate: '2023-05-01T00:00:00.000Z'
      },
      {
        endDate: '2023-06-30T00:00:00.000Z',
        reading: 300,
        startDate: '2023-06-01T00:00:00.000Z'
      }
    ],
    startReading: 10
  }
  const requestedYear = 2023

  let payload
  let requestedMonth

  describe('when a valid payload is provided', () => {
    describe('because the user entered a valid meter reading', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '200' }
        requestedMonth = 4 // May
      })

      it('confirms the payload is valid', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not enter a number', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': 'INVALID' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "Reading must be a number or blank"', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Reading must be a number or blank')
      })
    })

    describe('because the user entered a negative number', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '-200' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "Reading must be a positive number"', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Reading must be a positive number')
      })
    })

    describe('because the user entered a reading less than the start reading of 10', () => {
      beforeEach(() => {
        payload = { '2023-04-30T00:00:00.000Z': '5' }
        requestedMonth = 3 // April
      })

      it('fails validation with the message "The reading must be greater than or equal to the previous reading of 10"', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'The reading must be greater than or equal to the previous reading of 10'
        )
      })
    })

    describe('because the user entered a reading less than the previous months highest reading of 100', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '50' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "The reading must be greater than or equal to the previous reading of 100"', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'The reading must be greater than or equal to the previous reading of 100'
        )
      })
    })

    describe('because the user entered a reading higher than the next months lowest reading of 300', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '400' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "The reading must be less than or equal to the subsequent reading of 300"', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'The reading must be less than or equal to the subsequent reading of 300'
        )
      })
    })

    describe('because the user entered meter readings not in increasing order', () => {
      beforeEach(() => {
        payload = { '2023-05-30T00:00:00.000Z': '200', '2023-05-31T00:00:00.000Z': '150' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "Each reading must be greater than or equal to the previous reading"', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Each reading must be greater than or equal to the previous reading'
        )
      })
    })

    describe('because the user entered a number that exceeds the maximum allowed reading of "99999999999"', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '999999999991' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "Reading entered exceeds the maximum of 99999999999"', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Reading entered exceeds the maximum of 99999999999')
      })
    })

    describe('because the user entered a number that exceeds the maximum safe number "9007199254740991"', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '9007199254740992' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "Reading entered exceeds the maximum of 99999999999"', () => {
        const result = ReadingsValidator.go(payload, requestedYear, requestedMonth, session)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Reading entered exceeds the maximum of 99999999999')
      })
    })
  })
})
