'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckValidator = require('../../../../../app/validators/return-versions/setup/check/check.validator.js')

describe('Check validator', () => {
  describe('when valid data is provided', () => {
    const returnCycles = ['winter-and-all-year', 'winter-and-all-year', 'winter-and-all-year']

    it('confirms the data is valid', () => {
      const result = CheckValidator.go(returnCycles)

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    const returnCycles = ['summer', 'winter-and-all-year', 'winter-and-all-year']

    it('it fails validation', () => {
      const result = CheckValidator.go(returnCycles)

      expect(result.value).to.exist()
      expect(result.error).to.exist()
      expect(result.error.details[0].message).to.equal(
        "Quarterly returns submissions can't be set for returns in the summer cycle."
      )
    })
  })
})
