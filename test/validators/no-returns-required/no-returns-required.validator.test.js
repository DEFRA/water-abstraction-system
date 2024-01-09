const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const noReturnsRequired = require('../../../app/validators/return-requirements/no-returns-required.validator.js')
const { reasonNewRequirementsFields } = require('../../../app/lib/static-lookups.lib.js')

const { describe, it } = exports.lab = Lab.script()

describe('No Returns Required Validation', () => {
  reasonNewRequirementsFields.forEach(reason => {
    it(`should validate for valid reason: ${reason}`, () => {
      const { error } = noReturnsRequired.go({ reasonNewRequirements: reason })
      expect(error).to.be.undefined()
    })
  })

  it('should fail validation for invalid reason', () => {
    const { error } = noReturnsRequired.go({ reasonNewRequirements: '' })
    expect(error).to.exist()
    expect(error.details[0].message).to.equal('Select the reason for the return requirement')
  })
})
