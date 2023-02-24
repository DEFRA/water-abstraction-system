'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')

// Thing under test
const InvoiceAccountModel = require('../../../app/models/crm-v2/invoice-account.model.js')

describe('Invoice Account model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testRecord = await InvoiceAccountHelper.add()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await InvoiceAccountModel.query().findById(testRecord.invoiceAccountId)

      expect(result).to.be.an.instanceOf(InvoiceAccountModel)
      expect(result.invoiceAccountId).to.equal(testRecord.invoiceAccountId)
    })
  })
})
