'use strict'

// Thing under test
const SeasonValidator = require('../../../../app/validators/bill-runs/setup/season.validator.js')

describe('Bill Runs Setup Season validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = SeasonValidator({ season: 'summer' })

      expect(result.value).toBeDefined()
      expect(result.error).toBeUndefined()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "season" is given', () => {
      it('fails validation', () => {
        const result = SeasonValidator({ season: '' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the season')
      })
    })

    describe('because an unknown "season" is given', () => {
      it('fails validation', () => {
        const result = SeasonValidator({ type: 'spring' })

        expect(result.value).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Select the season')
      })
    })
  })
})
