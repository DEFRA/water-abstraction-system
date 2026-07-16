// Test framework
import { describe, expect, it } from 'vitest'

// Thing under test
import MethodValidator from '../../../../app/validators/return-versions/setup/method.validator.js'

describe('Return Versions Setup - Method validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = MethodValidator({ method: 'useAbstractionData' })

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "method" is given', () => {
      it('fails validation', () => {
        const result = MethodValidator({ method: '' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select how you want to set up the requirements for returns')
      })
    })

    describe('because an unknown "method" is given', () => {
      it('fails validation', () => {
        const result = MethodValidator({ method: 'just-because' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select how you want to set up the requirements for returns')
      })
    })
  })
})
