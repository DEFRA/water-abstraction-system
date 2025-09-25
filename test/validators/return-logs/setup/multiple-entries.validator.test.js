'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const MultipleEntriesValidator = require('../../../../app/validators/return-logs/setup/multiple-entries.validator.js')

describe('Return Logs Setup - Multiple Entries validator', () => {
  let frequency
  let measurementType
  let payload

  const length = 12
  const startReading = 100

  describe('when a valid payload is provided', () => {
    describe('because the user entered 12 meter readings', () => {
      beforeEach(() => {
        frequency = 'monthly'
        measurementType = 'meter readings'
        payload = {
          multipleEntries: ['100', '101', null, '103', '104', '105', null, '107', '108', '109', '110', '111']
        }
      })

      it('confirms the payload is valid', () => {
        const result = MultipleEntriesValidator.go(frequency, length, measurementType, payload, startReading)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user entered 12 volumes', () => {
      beforeEach(() => {
        frequency = 'weekly'
        measurementType = 'volumes'
        payload = {
          multipleEntries: ['50', '1000', null, '10.4', '155', '655', '133482', '110.10', '1080', null, '475', '676']
        }
      })

      it('confirms the payload is valid', () => {
        const result = MultipleEntriesValidator.go(frequency, length, measurementType, payload, startReading)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not enter anything', () => {
      beforeEach(() => {
        frequency = 'monthly'
        measurementType = 'meter readings'
        payload = {}
      })

      it('fails validation with the message "Enter 12 monthly meter readings"', () => {
        const result = MultipleEntriesValidator.go(frequency, length, measurementType, payload, startReading)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter 12 monthly meter readings')
      })
    })

    describe('because the user entered the wrong amount of entries', () => {
      beforeEach(() => {
        frequency = 'monthly'
        measurementType = 'meter readings'
        payload = { multipleEntries: ['100', null, '102', '103', '104', '105', '106', '107', '108', '109'] }
      })

      it('fails validation with the message "Enter 12 monthly meter readings"', () => {
        const result = MultipleEntriesValidator.go(frequency, length, measurementType, payload, startReading)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter 12 monthly meter readings')
      })
    })

    describe('because the user entered a negative number', () => {
      beforeEach(() => {
        frequency = 'daily'
        measurementType = 'volumes'
        payload = {
          multipleEntries: ['100', '101', '102', '103', '104', null, '106', '107', '108', '109', '110', '-111']
        }
      })

      it('fails validation with the message "Volumes must be a positive number"', () => {
        const result = MultipleEntriesValidator.go(frequency, length, measurementType, payload, startReading)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Volumes must be a positive number')
      })
    })

    describe('because the user entered text (besides the "x" character which represents a null value', () => {
      beforeEach(() => {
        frequency = 'weekly'
        measurementType = 'volumes'
        payload = {
          multipleEntries: ['100', null, '102', '103', '104', '105', null, '107', '108', '109', '110', 'NaN']
        }
      })

      it('fails validation with the message "Volumes must be a number or x for a blank row"', () => {
        const result = MultipleEntriesValidator.go(frequency, length, measurementType, payload, startReading)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Volumes must be a number or x for a blank row')
      })
    })

    describe('because the user enter a value less than the start meter reading', () => {
      beforeEach(() => {
        frequency = 'weekly'
        measurementType = 'meter readings'
        payload = { multipleEntries: ['50', '101', '102', '103', '104', '105', null, '105', '104', '103', null, '120'] }
      })

      it('fails validation with the message "The meter readings must be greater than or equal to the start reading of 100"', () => {
        const result = MultipleEntriesValidator.go(frequency, length, measurementType, payload, startReading)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'The meter readings must be greater than or equal to the start reading of 100'
        )
      })
    })

    describe('because the user entered meter readings not in increasing order', () => {
      beforeEach(() => {
        frequency = 'weekly'
        measurementType = 'meter readings'
        payload = {
          multipleEntries: ['100', '101', '102', null, '104', '105', '106', '105', '104', '103', '110', '120']
        }
      })

      it('fails validation with the message "Each meter reading must be greater than or equal to the previous reading"', () => {
        const result = MultipleEntriesValidator.go(frequency, length, measurementType, payload, startReading)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Each meter reading must be greater than or equal to the previous reading'
        )
      })
    })
  })
})
