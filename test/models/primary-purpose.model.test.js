'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const PrimaryPurposeHelper = require('../support/helpers/primary-purpose.helper.js')

// Thing under test
const PrimaryPurposeModel = require('../../app/models/primary-purpose.model.js')

describe('Primary Purpose model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await PrimaryPurposeHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await PrimaryPurposeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(PrimaryPurposeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
