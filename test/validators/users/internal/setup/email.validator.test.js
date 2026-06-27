'use strict'

// Thing under test
const EmailValidator = require('../../../../../app/validators/users/internal/setup/email.validator.js')

describe('Users - Internal - Setup - Email Validator', () => {
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
      const result = EmailValidator.go(payload, emailExists)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the payload is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = EmailValidator.go(payload, emailExists)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter an email address for this user')
      })
    })

    describe('because the email address is not a valid', () => {
      beforeEach(() => {
        payload = { email: 'bad-mail' }
      })

      it('returns with errors', () => {
        const result = EmailValidator.go(payload, emailExists)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'Enter an email address in the correct format, like name@environment-agency.gov.uk'
        )
      })
    })

    describe('because the email address is longer than 100 characters', () => {
      beforeEach(() => {
        payload = { email: `${'a'.repeat(101)}@environment-agency.gov.uk` }
      })

      it('returns with errors', () => {
        const result = EmailValidator.go(payload, emailExists)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Email must be 100 characters or less')
      })
    })

    describe('because the email address does not end in gov.uk', () => {
      beforeEach(() => {
        payload = { email: 'bad-mail@test.com' }
      })

      it('returns with errors', () => {
        const result = EmailValidator.go(payload, emailExists)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
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
        const result = EmailValidator.go(payload, emailExists)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a different email address than one that already exists')
      })
    })
  })
})
