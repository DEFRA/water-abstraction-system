'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const ReturnRequirementHelper = require('../support/helpers/return-requirement.helper.js')

// Thing under test
const ReturnRequirementModel = require('../../app/models/return-requirement.model.js')

describe('Return Requirement model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await ReturnRequirementHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnRequirementModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
