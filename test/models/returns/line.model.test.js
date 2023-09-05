'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LineHelper = require('../../support/helpers/returns/line.helper.js')

// Thing under test
const LineModel = require('../../../app/models/returns/line.model.js')

describe('Line model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await LineHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LineModel.query().findById(testRecord.lineId)

      expect(result).to.be.an.instanceOf(LineModel)
      expect(result.lineId).to.equal(testRecord.lineId)
    })
  })
})
