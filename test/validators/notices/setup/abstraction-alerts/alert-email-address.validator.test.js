'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AlertEmailAddressValidator = require('../../../../../app/validators/notices/setup/abstraction-alerts/alert-email-address.validator.js')

describe('Alert Email Address Validator', () => {
  let payload

  beforeEach(() => {
    payload = { alertEmailAddress: 'username' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = AlertEmailAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })

    describe('and the "otherUser"', () => {
      describe('is an invalid email address', () => {
        beforeEach(() => {
          payload = { alertEmailAddress: 'other', otherUser: '123123123' }
        })

        it('returns with errors', () => {
          const result = AlertEmailAddressValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal(
            'Enter an email address in the correct format, like name@example.com'
          )
        })
      })

      describe('is an empty string', () => {
        beforeEach(() => {
          payload = { alertEmailAddress: 'other', otherUser: '' }
        })

        it('returns with errors', () => {
          const result = AlertEmailAddressValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).to.exist()
          expect(result.error.details[0].message).to.equal('Enter an email address')
        })
      })

      describe('is a valid email address', () => {
        beforeEach(() => {
          payload = { alertEmailAddress: 'other', otherUser: 'test@defra.gov.uk' }
        })

        it('returns with no errors', () => {
          const result = AlertEmailAddressValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).not.to.exist()
        })
      })

      describe('is a valid email address but "alertEmailAddress" is username', () => {
        beforeEach(() => {
          payload = { alertEmailAddress: 'username', otherUser: 'test@defra.gov.uk' }
        })

        it('returns with no errors', () => {
          const result = AlertEmailAddressValidator.go(payload)

          expect(result.value).to.exist()
          expect(result.error).not.to.exist()
        })
      })
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = AlertEmailAddressValidator.go(payload)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal('Enter an email address')
    })
  })
})
