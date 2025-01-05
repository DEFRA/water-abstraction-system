'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceEndDateChangeHelper = require('../support/helpers/licence-end-date-change.helper.js')

// Thing under test
const LicenceEndDateChangeModel = require('../../app/models/licence-end-date-change.model.js')

describe.only('Licence End Date Change model', () => {
  let testRecord

  before(async () => {
    // Test record
    testRecord = await LicenceEndDateChangeHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceEndDateChangeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceEndDateChangeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
