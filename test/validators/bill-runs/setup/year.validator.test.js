'use strict'

// Thing under test
const YearValidator = require('../../../../app/validators/bill-runs/setup/year.validator.js')

describe('Bill Runs Setup Year validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = YearValidator({ year: '2022' })

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "year" is given', () => {
      it('fails validation', () => {
        const result = YearValidator({ year: '' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the financial year')
      })
    })

    describe('because an unknown "year" is given', () => {
      it('fails validation', () => {
        const result = YearValidator({ year: '2020' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the financial year')
      })
    })
  })
})
