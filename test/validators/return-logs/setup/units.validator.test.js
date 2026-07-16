// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import UnitsValidator from '../../../../app/validators/return-logs/setup/units.validator.js'

describe('Return Logs Setup - Units validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user selected the "cubicMetres" option', () => {
      beforeEach(() => {
        payload = { units: 'cubicMetres' }
      })

      it('confirms the payload is valid', () => {
        const result = UnitsValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })

    describe('because the user selected the "litres" option', () => {
      beforeEach(() => {
        payload = { units: 'litres' }
      })

      it('confirms the payload is valid', () => {
        const result = UnitsValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })

    describe('because the user selected the "megalitres" option', () => {
      beforeEach(() => {
        payload = { units: 'megalitres' }
      })

      it('confirms the payload is valid', () => {
        const result = UnitsValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })

    describe('because the user selected the "gallons" option', () => {
      beforeEach(() => {
        payload = { units: 'gallons' }
      })

      it('confirms the payload is valid', () => {
        const result = UnitsValidator(payload)

        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user did not select an option', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the message "Select which units were used"', () => {
        const result = UnitsValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select which units were used')
      })
    })
  })
})
