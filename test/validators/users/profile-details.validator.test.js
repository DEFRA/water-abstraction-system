'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ProfileDetailsValidator = require('../../../app/validators/users/profile-details.validator.js')

describe('ProfileDetailsValidator', () => {
  it('should validate a fully valid payload', () => {
    const payload = {
      name: 'John Doe',
      jobTitle: 'Developer',
      email: 'john.doe@example.com',
      tel: '1234567890',
      address: '123 Main St'
    }
    const result = ProfileDetailsValidator.go(payload)
    expect(result.error).to.be.undefined()
    expect(result.value).to.equal(payload)
  })

  it('should allow empty strings for all fields', () => {
    const payload = {
      name: '',
      jobTitle: '',
      email: '',
      tel: '',
      address: ''
    }
    const result = ProfileDetailsValidator.go(payload)
    expect(result.error).to.be.undefined()
    expect(result.value).to.equal(payload)
  })

  it('should fail if name exceeds 100 characters', () => {
    const payload = {
      name: 'a'.repeat(101),
      jobTitle: '',
      email: '',
      tel: '',
      address: ''
    }
    const result = ProfileDetailsValidator.go(payload)
    expect(result.error).to.not.be.undefined()
    expect(result.error.details[0].message).to.equal('Name must be 100 characters or less')
  })

  it('should fail if jobTitle exceeds 100 characters', () => {
    const payload = {
      name: '',
      jobTitle: 'b'.repeat(101),
      email: '',
      tel: '',
      address: ''
    }
    const result = ProfileDetailsValidator.go(payload)
    expect(result.error).to.not.be.undefined()
    expect(result.error.details[0].message).to.equal('Job title must be 100 characters or less')
  })

  it('should fail if tel exceeds 100 characters', () => {
    const payload = {
      name: '',
      jobTitle: '',
      email: '',
      tel: '1'.repeat(101),
      address: ''
    }
    const result = ProfileDetailsValidator.go(payload)
    expect(result.error).to.not.be.undefined()
    expect(result.error.details[0].message).to.equal('Telephone number must be 100 characters or less')
  })

  it('should fail if address exceeds 100 characters', () => {
    const payload = {
      name: '',
      jobTitle: '',
      email: '',
      tel: '',
      address: 'x'.repeat(101)
    }
    const result = ProfileDetailsValidator.go(payload)
    expect(result.error).to.not.be.undefined()
    expect(result.error.details[0].message).to.equal('Address must be 100 characters or less')
  })

  it('should fail if email is invalid', () => {
    const payload = {
      name: '',
      jobTitle: '',
      email: 'not-an-email',
      tel: '',
      address: ''
    }
    const result = ProfileDetailsValidator.go(payload)
    expect(result.error).to.not.be.undefined()
    expect(result.error.details[0].message).to.equal('Enter a valid email')
  })

  it('should allow missing fields (they will be undefined)', () => {
    const payload = {}
    const result = ProfileDetailsValidator.go(payload)
    expect(result.error).to.be.undefined()
    expect(result.value).to.equal({})
  })
})
