// Thing under test
import CompanySearchValidator from '../../../../app/validators/billing-accounts/setup/company-search.validator.js'

describe('Billing Accounts - Setup - Company Search Validator', () => {
  let payload

  beforeEach(() => {
    payload = { companySearch: 'Company Name' }
  })

  describe('when called with valid data', () => {
    it('returns with no errors', () => {
      const result = CompanySearchValidator(payload)

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when called with invalid data', () => {
    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns with errors', () => {
        const result = CompanySearchValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Enter the Companies House number or company name')
      })
    })

    describe('with a "company search" value longer than 100 characters', () => {
      beforeEach(() => {
        payload = { companySearch: 'a'.repeat(101) }
      })

      it('returns with errors', () => {
        const result = CompanySearchValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'Companies House number or company name must be 100 characters or less'
        )
      })
    })
  })
})
