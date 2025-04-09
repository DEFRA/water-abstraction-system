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
        payload = { 'reading-0': '200' }
        requestedMonth = 4 // May
      })

      it('confirms the payload is valid', () => {
        const result = ReadingsValidator.go(payload, session, requestedYear, requestedMonth)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not enter a number', () => {
      beforeEach(() => {
        payload = { 'reading-0': 'INVALID' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "Meter readings must be a number or blank"', () => {
        const result = ReadingsValidator.go(payload, session, requestedYear, requestedMonth)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Meter readings must be a number or blank')
      })
    })

    describe('because the user entered a negative number', () => {
      beforeEach(() => {
        payload = { 'reading-0': '-200' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "Meter readings must be a positive number"', () => {
        const result = ReadingsValidator.go(payload, session, requestedYear, requestedMonth)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Meter readings must be a positive number')
      })
    })

    describe('because the user entered a reading less than the start reading of 10', () => {
      beforeEach(() => {
        payload = { 'reading-0': '5' }
        requestedMonth = 3 // April
      })

      it('fails validation with the message "The meter readings must be greater than or equal to the previous reading of 10"', () => {
        const result = ReadingsValidator.go(payload, session, requestedYear, requestedMonth)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'The meter readings must be greater than or equal to the previous reading of 10'
        )
      })
    })

    describe('because the user entered a reading less than the previous months highest reading of 100', () => {
      beforeEach(() => {
        payload = { 'reading-0': '50' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "The meter readings must be greater than or equal to the previous reading of 100"', () => {
        const result = ReadingsValidator.go(payload, session, requestedYear, requestedMonth)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'The meter readings must be greater than or equal to the previous reading of 100'
        )
      })
    })

    describe('because the user entered a reading higher than the next months lowest reading of 300', () => {
      beforeEach(() => {
        payload = { 'reading-0': '400' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "The meter readings must be less than or equal to the subsequent reading of 300"', () => {
        const result = ReadingsValidator.go(payload, session, requestedYear, requestedMonth)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'The meter readings must be less than or equal to the subsequent reading of 300'
        )
      })
    })

    describe('because the user entered meter readings not in increasing order', () => {
      beforeEach(() => {
        payload = { 'reading-0': '200', 'reading-1': '150' }
        requestedMonth = 4 // May
      })

      it('fails validation with the message "Each meter reading must be greater than or equal to the previous reading"', () => {
        const result = ReadingsValidator.go(payload, session, requestedYear, requestedMonth)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Each meter reading must be greater than or equal to the previous reading'
        )
      })
    })
  })
})
