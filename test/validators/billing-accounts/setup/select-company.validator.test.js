// Thing under test
import SelectCompanyValidator from '../../../../app/validators/billing-accounts/setup/select-company.validator.js'

describe('Billing Accounts - Setup - Select Company Validator', () => {
  let payload

  beforeEach(() => {
    payload = { companiesHouseNumber: '12345678' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = SelectCompanyValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns with errors', () => {
      const result = SelectCompanyValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.error.details[0].message).toEqual('Select a company from the list')
    })
  })
})
