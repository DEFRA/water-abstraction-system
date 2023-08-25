'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')

// Thing under test
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

describe('Invoice Account Address model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await InvoiceAccountAddressHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await InvoiceAccountAddressModel.query().findById(testRecord.invoiceAccountAddressId)

      expect(result).to.be.an.instanceOf(InvoiceAccountAddressModel)
      expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)
    })
  })
})
