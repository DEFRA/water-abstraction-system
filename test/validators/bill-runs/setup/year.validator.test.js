'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const YearValidator = require('../../../../app/validators/bill-runs/setup/year.validator.js')

describe('Bill Runs Setup Year validator', () => {
  describe('when valid data is provided', () => {
    it('confirms the data is valid', () => {
      const result = YearValidator.go({ year: '2022' })

      expect(result.value).to.exist()
      expect(result.error).not.to.exist()
    })
  })

  describe('when invalid data is provided', () => {
    describe("because no 'year' is given", () => {
      it('fails validation', () => {
        const result = YearValidator.go({ year: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the financial year')
      })
    })

    describe("because an unknown 'year' is given", () => {
      it('fails validation', () => {
        const result = YearValidator.go({ year: '2020' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the financial year')
      })
    })
  })
})
