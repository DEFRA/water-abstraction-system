// Thing under test
import FAOValidator from '../../../../app/validators/billing-accounts/setup/fao.validator.js'

describe('Billing Accounts - Setup - FAO Validator', () => {
  let payload

  beforeEach(() => {
    payload = { fao: 'yes' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = FAOValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = FAOValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select yes if you need to add an FAO')
    })
  })
})
