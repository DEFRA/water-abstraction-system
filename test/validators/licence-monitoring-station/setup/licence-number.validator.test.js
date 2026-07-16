// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import { licenceEnds } from '../../../support/fixtures/licence.fixture.js'
import { yesterday } from '../../../support/general.js'

// Thing under test
import LicenceNumberValidator from '../../../../app/validators/licence-monitoring-station/setup/licence-number.validator.js'

describe('Licence Monitoring Station Setup - Licence Number Validator', () => {
  let licence
  let payload = {}

  beforeEach(() => {
    licence = licenceEnds()
  })

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = {
        licenceRef: '1234567890'
      }
    })

    it('returns with no errors', () => {
      const result = LicenceNumberValidator(payload, licence)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('because the licence number is not present', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator(payload, licence)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a licence number')
      })
    })

    describe('because the licence number is empty', () => {
      beforeEach(() => {
        payload = {
          licenceRef: ''
        }
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator(payload, licence)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter a licence number')
      })
    })

    describe('because the licence number was not found', () => {
      beforeEach(() => {
        licence = undefined

        payload = {
          licenceRef: LicenceHelper.generateLicenceRef()
        }
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator(payload, licence)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Licence could not be found')
      })
    })

    describe('because the licence has ended', () => {
      beforeEach(() => {
        licence = licenceEnds(yesterday())

        payload = {
          licenceRef: LicenceHelper.generateLicenceRef()
        }
      })

      it('returns with errors', () => {
        const result = LicenceNumberValidator(payload, licence)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('The licence has ended')
      })
    })
  })
})
