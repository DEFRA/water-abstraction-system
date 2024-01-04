const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const { noReturnsRequired } = require('../../validators/no-returns-required/no-returns-required.validation.js')
const { reasonNewRequirementsFields } = require('../../../lib/static-lookups.lib.js')

const { describe, it } = exports.lab = Lab.script()

describe('No Returns Required Validation', () => {
  it.each(reasonNewRequirementsFields)('should validate for valid reason: %s', (reason) => {
    const { error } = noReturnsRequired({ reasonNewRequirements: reason })
    expect(error).to.be.undefined()
  })

  it('should fail validation for invalid reason', () => {
    const { error } = noReturnsRequired({ reasonNewRequirements: '' })
    expect(error).to.exist()
    expect(error.details[0].message).to.equal('Select the reason for the return requirement')
  })
})
