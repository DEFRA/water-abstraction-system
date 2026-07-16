// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import LicencesValidator from '../../../../app/validators/company-contacts/setup/licences.validator.js'

describe('Company Contacts - Setup - Licences Validator', () => {
  let payload

  beforeEach(() => {
    payload = { licences: [generateUUID()] }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = LicencesValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('when no licences are selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = LicencesValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'Select the licences they should get water abstraction alerts emails for'
        )
      })
    })

    describe('when "licences" is an empty array', () => {
      beforeEach(() => {
        payload = { licences: [] }
      })

      it('returns with errors', () => {
        const result = LicencesValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'Select the licences they should get water abstraction alerts emails for'
        )
      })
    })

    describe('when "licences" is not an array', () => {
      beforeEach(() => {
        payload = { licences: 'licence' }
      })

      it('returns with errors', () => {
        const result = LicencesValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'Select the licences they should get water abstraction alerts emails for'
        )
      })
    })
  })
})
