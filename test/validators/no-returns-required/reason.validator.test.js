'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { selectReasonFields } = require('../../../app/lib/static-lookups.lib.js')

// Thing under test
const SelectReasonValidator = require('../../../app/validators/return-requirements/reason.validator.js')

describe('Select Reason validator', () => {
  describe('when valid data is provided', () => {
    selectReasonFields.forEach(reason => {
      it(`confirms the data is valid (reason ${reason})`, () => {
        const result = SelectReasonValidator.go({ reasonNewRequirements: reason })

        expect(result.value).to.exist()
        expect(result.error).not.to.exist()
      })
    })
  })

  describe('when valid data is provided', () => {
    describe("because no 'reason' is given", () => {
      it('fails validation', () => {
        const result = SelectReasonValidator.go({ reasonNewRequirements: '' })

        expect(result.value).to.exist()
        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Select the reason for the return requirement')
      })
    })
  })
})
