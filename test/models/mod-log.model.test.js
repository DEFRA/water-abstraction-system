'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ModLogHelper = require('../support/helpers/mod-log.helper.js')

// Thing under test
const ModLogModel = require('../../app/models/mod-log.model.js')

describe('Mod Log model', () => {
  let testRecord

  before(async () => {
    testRecord = await ModLogHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ModLogModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ModLogModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
