'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const AddressModel = require('../../../app/models/crm-v2/address.model.js')

describe('Address model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await AddressHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await AddressModel.query().findById(testRecord.addressId)

      expect(result).to.be.an.instanceOf(AddressModel)
      expect(result.addressId).to.equal(testRecord.addressId)
    })
  })
})
