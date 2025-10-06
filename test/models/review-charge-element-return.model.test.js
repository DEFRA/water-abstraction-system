'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReviewChargeElementReturnHelper = require('../support/helpers/review-charge-element-return.helper.js')

// Thing under test
const ReviewChargeElementReturnModel = require('../../app/models/review-charge-element-return.model.js')

describe('Review Charge Element Return model', () => {
  let testRecord

  before(async () => {
    testRecord = await ReviewChargeElementReturnHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReviewChargeElementReturnModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ReviewChargeElementReturnModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })
})
