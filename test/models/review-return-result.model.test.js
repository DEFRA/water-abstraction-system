'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const ReviewReturnResultHelper = require('../support/helpers/review-return-result.helper.js')

// Thing under test
const ReviewReturnResultModel = require('../../app/models/review-return-result.model.js')

describe('Review Return Result model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewReturnResultHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewReturnResultModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewReturnResultModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
