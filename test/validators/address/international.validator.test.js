// Thing under test
import InternationalValidator from '../../../app/validators/address/international.validator.js'

describe('Address - International Validator', () => {
  let payload

  describe('when called with valid data', () => {
    beforeEach(() => {
      payload = {
        addressLine1: '1 Fake Farm',
        addressLine2: '1 Fake street',
        addressLine3: 'Fake Village',
        addressLine4: 'Fake City',
        country: 'Ireland',
        postcode: '12345678'
      }
    })

    it('returns with no errors', () => {
      const result = InternationalValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with no data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = InternationalValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error.details[0].message).toEqual('Enter address line 1')
      expect(result.error.details[1].message).toEqual('Select a country')
    })
  })

  describe('when called with an invalid addressLine1', () => {
    beforeEach(() => {
      payload = { addressLine1: '<', country: 'Ireland' }
    })

    it('returns with errors', () => {
      const result = InternationalValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error.details[0].message).toEqual('Address line 1 cannot start with a special character')
    })
  })

  describe('when called with an invalid addressLine2', () => {
    beforeEach(() => {
      payload = { addressLine1: '1 Fake Farm', addressLine2: '@', country: 'Ireland' }
    })

    it('returns with errors', () => {
      const result = InternationalValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error.details[0].message).toEqual('Address line 2 cannot start with a special character')
    })
  })

  describe('when called with an invalid addressLine3', () => {
    beforeEach(() => {
      payload = { addressLine1: '1 Fake Farm', addressLine3: '(', country: 'Ireland' }
    })

    it('returns with errors', () => {
      const result = InternationalValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error.details[0].message).toEqual('Address line 3 cannot start with a special character')
    })
  })

  describe('when called with an invalid addressLine4', () => {
    beforeEach(() => {
      payload = { addressLine1: '1 Fake Farm', addressLine4: ')', country: 'Ireland' }
    })

    it('returns with errors', () => {
      const result = InternationalValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error.details[0].message).toEqual('Address line 4 cannot start with a special character')
    })
  })
})
