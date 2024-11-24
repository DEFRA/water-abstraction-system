'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SupplementaryYearValidator = require('../../../../app/validators/licences/supplementary/supplementary-year.validator.js')

describe('Supplementary Year validator', () => {
  let payload

  describe('when valid data is provided', () => {
    describe('that has a single year', () => {
      beforeEach(() => {
        payload = { supplementaryYears: '2025' }
      })

      it('confirms the data is valid', () => {
        const result = SupplementaryYearValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })

    describe('that has multiple years', () => {
      beforeEach(() => {
        payload = { supplementaryYears: ['2025', '2024'] }
      })

      it('confirms the data is valid', () => {
        const result = SupplementaryYearValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when invalid data is provided', () => {
    describe('because no year was picked', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation', () => {
        const result = SupplementaryYearValidator.go(payload)

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select at least one financial year')
      })
    })
  })
})
