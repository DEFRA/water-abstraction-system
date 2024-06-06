'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../support/database.js')
const ReturnVersionHelper = require('../support/helpers/return-version.helper.js')

// Thing under test
const ReturnVersionModel = require('../../app/models/return-version.model.js')

describe('Return Version model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await ReturnVersionHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
