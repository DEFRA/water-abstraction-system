'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReportedValidator = require('../../../../app/validators/return-logs/setup/reported.validator.js')

describe('Return Logs Setup - Reported validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the "meterReadings" option', () => {
      beforeEach(() => {
        payload = { reported: 'meterReadings' }
      })

      it('confirms the payload is valid', () => {
        const result = ReportedValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })

    describe('because the user selected the "abstractionVolumes" option', () => {
      beforeEach(() => {
        payload = { reported: 'abstractionVolumes' }
      })

      it('confirms the payload is valid', () => {
        const result = ReportedValidator.go(payload)

        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select how this return was reported"', () => {
        const result = ReportedValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select how this return was reported')
      })
    })
  })
})
