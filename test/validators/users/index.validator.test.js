'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const IndexValidator = require('../../../app/validators/users/index.validator.js')

describe('Users - Index validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('that is fully populated', () => {
      beforeEach(() => {
        payload = _payload()
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.equal({
          email: 'test@test.com',
          permissions: 'basic',
          status: 'enabled',
          type: 'water_admin'
        })
        expect(result.error).not.to.exist()
      })
    })

    describe('that is partially populated', () => {
      beforeEach(() => {
        payload = _payload()

        delete payload.permissions
        delete payload.status
        delete payload.type
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.equal({
          email: 'test@test.com'
        })
        expect(result.error).not.to.exist()
      })
    })

    describe('that is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.equal({})
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    beforeEach(() => {
      payload = _payload()
    })

    describe('because "email" is too long', () => {
      beforeEach(() => {
        payload.email = 'a'.repeat(256)
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Email must be 255 characters or less')
        expect(result.error.details[0].path[0]).to.equal('email')
      })
    })

    describe('because "permissions" is unknown', () => {
      beforeEach(() => {
        payload.permissions = 'foo'
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid permission')
        expect(result.error.details[0].path[0]).to.equal('permissions')
      })
    })

    describe('because "status" is unknown', () => {
      beforeEach(() => {
        payload.status = 'foo'
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid status')
        expect(result.error.details[0].path[0]).to.equal('status')
      })
    })

    describe('because "type" is unknown', () => {
      beforeEach(() => {
        payload.type = 'foo'
      })

      it('fails validation', () => {
        const result = IndexValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error.details[0].message).to.equal('Select a valid type')
        expect(result.error.details[0].path[0]).to.equal('type')
      })
    })
  })
})

function _payload() {
  return {
    email: 'test@test.com',
    permissions: 'basic',
    status: 'enabled',
    type: 'water_admin'
  }
}
