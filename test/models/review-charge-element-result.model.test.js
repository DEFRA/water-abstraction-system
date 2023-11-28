'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const ReviewChargeElementResultHelper = require('../support/helpers/review-charge-element-result.helper.js')

// Thing under test
const ReviewChargeElementResultModel = require('../../app/models/review-charge-element-result.model.js')

describe('Review Charge Element Result model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewChargeElementResultHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeElementResultModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewChargeElementResultModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
