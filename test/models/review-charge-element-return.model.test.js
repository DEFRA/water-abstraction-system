'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../support/database.js')
const ReviewChargeElementReturnHelper = require('../support/helpers/review-charge-element-return.helper.js')

// Thing under test
const ReviewChargeElementReturnModel = require('../../app/models/review-charge-element-return.model.js')

describe('Review Charge Element Return model', () => {
  let testRecord

  after(async () => {
    await closeConnection()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await ReviewChargeElementReturnHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeElementReturnModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewChargeElementReturnModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
