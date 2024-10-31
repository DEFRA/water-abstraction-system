'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it } = require('node:test')
const { expect } = Code

// Thing under test
const SeasonValidator = require('../../../../app/validators/bill-runs/setup/season.validator.js')

describe('Bill Runs Setup Season validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = SeasonValidator.go({ season: 'summer' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no "season" is given', () => {
      it('fails validation', () => {
        const result = SeasonValidator.go({ season: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the season')
      })
    })

    describe('because an unknown "season" is given', () => {
      it('fails validation', () => {
        const result = SeasonValidator.go({ type: 'spring' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the season')
      })
    })
  })
})
