'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const SecondaryPurposeHelper = require('../support/helpers/secondary-purpose.helper.js')

// Thing under test
const SecondaryPurposeModel = require('../../app/models/secondary-purpose.model.js')

describe('Secondary Purpose model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await SecondaryPurposeHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await SecondaryPurposeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(SecondaryPurposeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
