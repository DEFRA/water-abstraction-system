'use strict'

// Thing under test
const ProfileDetailsValidator = require('../../../app/validators/users/profile-details.validator.js')

describe('Users - Profile Details validator', () => {
  let payload

  describe('when the payload is valid', () => {
    beforeEach(() => {
      payload = {
        name: 'John Doe',
        jobTitle: 'Developer',
        email: 'john.doe@environment-agency.gov.uk',
        tel: '1234567890',
        address: '123 Main St'
      }
    })

    it('confirms the payload is valid', () => {
      const result = ProfileDetailsValidator.go(payload)

      expect(result.error).toBeUndefined()
      expect(result.value).toEqual(payload)
    })
  })

  describe('when the payload fields are empty', () => {
    beforeEach(() => {
      payload = { name: '', jobTitle: '', email: '', tel: '', address: '' }
    })

    it('confirms the payload is valid', () => {
      const result = ProfileDetailsValidator.go(payload)

      expect(result.error).toBeUndefined()
      expect(result.value).toEqual(payload)
    })
  })

  describe('when the payload fields are missing', () => {
    beforeEach(() => {
      payload = {}
    })

    it('confirms the payload is valid', () => {
      const result = ProfileDetailsValidator.go(payload)

      expect(result.error).toBeUndefined()
      expect(result.value).toEqual(payload)
    })
  })

  describe('when the payload is invalid', () => {
    describe('because "name" was too long', () => {
      beforeEach(() => {
        payload = { name: 'a'.repeat(101) }
      })

      it('fails validation with the message "Name must be 100 characters or less"', () => {
        const result = ProfileDetailsValidator.go(payload)

        expect(result.error).not.toBeUndefined()
        expect(result.error.details[0].message).toEqual('Name must be 100 characters or less')
      })
    })

    describe('because "jobTitle" was too long', () => {
      beforeEach(() => {
        payload = { jobTitle: 'a'.repeat(101) }
      })

      it('fails validation with the message "Job title must be 100 characters or less"', () => {
        const result = ProfileDetailsValidator.go(payload)

        expect(result.error).not.toBeUndefined()
        expect(result.error.details[0].message).toEqual('Job title must be 100 characters or less')
      })
    })

    describe('because "tel" was too long', () => {
      beforeEach(() => {
        payload = { tel: 'a'.repeat(101) }
      })

      it('fails validation with the message "Telephone number must be 100 characters or less"', () => {
        const result = ProfileDetailsValidator.go(payload)

        expect(result.error).not.toBeUndefined()
        expect(result.error.details[0].message).toEqual('Telephone number must be 100 characters or less')
      })
    })

    describe('because "address" was too long', () => {
      beforeEach(() => {
        payload = { address: 'a'.repeat(301) }
      })

      it('fails validation with the message "Address must be 300 characters or less"', () => {
        const result = ProfileDetailsValidator.go(payload)

        expect(result.error).not.toBeUndefined()
        expect(result.error.details[0].message).toEqual('Address must be 300 characters or less')
      })
    })

    describe('because "email" is not a valid email address', () => {
      beforeEach(() => {
        payload = { email: 'not-an-email' }
      })

      it('fails validation with the message "Enter a valid email address"', () => {
        const result = ProfileDetailsValidator.go(payload)

        expect(result.error).not.toBeUndefined()
        expect(result.error.details[0].message).toEqual('Enter a valid email address')
      })
    })

    describe('because "email" does not match the required domain "@environment-agency.gov.uk"', () => {
      beforeEach(() => {
        payload = { email: 'someone@wrongdomain.com' }
      })

      it('fails validation with the message "Email address must be @environment-agency.gov.uk"', () => {
        const result = ProfileDetailsValidator.go(payload)

        expect(result.error).not.toBeUndefined()
        expect(result.error.details[0].message).toEqual('Email address must be @environment-agency.gov.uk')
      })
    })
  })
})
