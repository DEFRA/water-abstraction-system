// Thing under test
import SupplementaryYearValidator from '../../../../app/validators/licences/supplementary/supplementary-year.validator.js'

describe('Supplementary Year validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('that has a single year', () => {
      beforeEach(() => {
        payload = { supplementaryYears: '2025' }
      })

      it('confirms the data is valid', () => {
        const result = SupplementaryYearValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })

    describe('that has multiple years', () => {
      beforeEach(() => {
        payload = { supplementaryYears: ['2025', '2024'] }
      })

      it('confirms the data is valid', () => {
        const result = SupplementaryYearValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeUndefined()
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no year was picked', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = SupplementaryYearValidator(payload)

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select at least one financial year')
      })
    })
  })
})
