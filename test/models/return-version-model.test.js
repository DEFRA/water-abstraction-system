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

describe('Return version model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReturnVersionHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReturnVersionModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReturnVersionModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
