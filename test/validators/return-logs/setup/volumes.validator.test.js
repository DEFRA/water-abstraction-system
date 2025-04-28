'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const VolumesValidator = require('../../../../app/validators/return-logs/setup/volumes.validator.js')

describe('Return Logs Setup - Volumes validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user entered a valid volume', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '200' }
      })

      it('confirms the payload is valid', () => {
        const result = VolumesValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not enter a number', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': 'INVALID' }
      })

      it('fails validation with the message "Volumes must be a number or blank"', () => {
        const result = VolumesValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Volumes must be a number or blank')
      })
    })

    describe('because the user entered a negative number', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '-200' }
      })

      it('fails validation with the message "Volumes must be a positive number"', () => {
        const result = VolumesValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Volumes must be a positive number')
      })
    })

    describe('because the user entered a number the exceeds the maximum safe number of "9007199254740991"', () => {
      beforeEach(() => {
        payload = { '2023-05-31T00:00:00.000Z': '9007199254740992' }
      })

      it('fails validation with the message "Volume entered exceeds the maximum safe number 9007199254740991"', () => {
        const result = VolumesValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Volume entered exceeds the maximum safe number 9007199254740991'
        )
      })
    })
  })
})
