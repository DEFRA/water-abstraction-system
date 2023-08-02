'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const ReturnHelper = require('../../support/helpers/returns/return.helper.js')

// Thing under test
const ReturnModel = require('../../../app/models/returns/return.model.js')

describe('Return model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await ReturnHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnModel.query().findById(testRecord.returnId)

      expect(result).to.be.an.instanceOf(ReturnModel)
      expect(result.returnId).to.equal(testRecord.returnId)
    })
  })
})
