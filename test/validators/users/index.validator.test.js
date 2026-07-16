// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import IndexValidator from '../../../app/validators/users/index.validator.js'

describe('Users - Index validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('that is fully populated', () => {
      beforeEach(() => {
        payload = _payload()
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator(payload)

        expect(result.value).toEqual({
          email: 'test@test.com',
          permissions: 'basic',
          status: 'enabled',
          type: 'water_admin'
        })
        expect(result.error).toBeUndefined()
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
        const result = IndexValidator(payload)

        expect(result.value).toEqual({
          email: 'test@test.com'
        })
        expect(result.error).toBeUndefined()
      })
    })

    describe('that is empty', () => {
      beforeEach(() => {
        payload = {}
      })

      it('confirms the data is valid', () => {
        const result = IndexValidator(payload)

        expect(result.value).toEqual({})
        expect(result.error).toBeUndefined()
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
        const result = IndexValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error.details[0].message).toEqual('Email must be 255 characters or less')
        expect(result.error.details[0].path[0]).toEqual('email')
      })
    })

    describe('because "permissions" is unknown', () => {
      beforeEach(() => {
        payload.permissions = 'foo'
      })

      it('fails validation', () => {
        const result = IndexValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a valid permission')
        expect(result.error.details[0].path[0]).toEqual('permissions')
      })
    })

    describe('because "status" is unknown', () => {
      beforeEach(() => {
        payload.status = 'foo'
      })

      it('fails validation', () => {
        const result = IndexValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a valid status')
        expect(result.error.details[0].path[0]).toEqual('status')
      })
    })

    describe('because "type" is unknown', () => {
      beforeEach(() => {
        payload.type = 'foo'
      })

      it('fails validation', () => {
        const result = IndexValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select a valid type')
        expect(result.error.details[0].path[0]).toEqual('type')
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
