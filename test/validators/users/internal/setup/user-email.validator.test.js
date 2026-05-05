'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const UserEmailValidator = require('../../../../../app/validators/users/internal/setup/user-email.validator.js')

describe('Users - Internal - Setup - User Email Validator', () => {
  let emailExists
  let payload

  beforeEach(() => {
    emailExists = false
  })

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = { email: 'bob@environment-agency.gov.uk' }
    })

    it('returns with no errors', () => {
      const result = UserEmailValidator.go(payload, emailExists)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the payload is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = UserEmailValidator.go(payload, emailExists)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter an email address for this user')
      })
    })

    describe('because the email address is not a valid', () => {
      beforeEach(() => {
        payload = { email: 'bad-mail' }
      })

      it('returns with errors', () => {
        const result = UserEmailValidator.go(payload, emailExists)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Enter an email address in the correct format, like name@environment-agency.gov.uk'
        )
      })
    })

    describe('because the email address is longer than 100 characters', () => {
      beforeEach(() => {
        payload = { email: `${'a'.repeat(101)}@environment-agency.gov.uk` }
      })

      it('returns with errors', () => {
        const result = UserEmailValidator.go(payload, emailExists)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Email must be 100 characters or less')
      })
    })

    describe('because the email address does not end in gov.uk', () => {
      beforeEach(() => {
        payload = { email: 'bad-mail@test.com' }
      })

      it('returns with errors', () => {
        const result = UserEmailValidator.go(payload, emailExists)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Enter a gov.uk email address, like name@environment-agency.gov.uk'
        )
      })
    })

    describe('because the email address already exists', () => {
      beforeEach(() => {
        emailExists = true
        payload = { email: 'bob@environment-agency.gov.uk' }
      })

      it('returns with errors', () => {
        const result = UserEmailValidator.go(payload, emailExists)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Enter a different email address than one that already exists')
      })
    })
  })
})
