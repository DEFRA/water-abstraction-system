'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const AddressModel = require('../../../app/models/crm-v2/address.model.js')

describe('Address model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await AddressHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await AddressModel.query().findById(testRecord.addressId)

      expect(result).to.be.an.instanceOf(AddressModel)
      expect(result.addressId).to.equal(testRecord.addressId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to invoice account addresses', () => {
      let testInvoiceAccountAddresses

      beforeEach(async () => {
        testRecord = await AddressHelper.add()
        const { addressId } = testRecord

        testInvoiceAccountAddresses = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
          // invoiceAccountId and start date
          const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
          const invoiceAccountAddress = await InvoiceAccountAddressHelper.add({ startDate, addressId })
          testInvoiceAccountAddresses.push(invoiceAccountAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await AddressModel.query()
          .innerJoinRelated('invoiceAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the invoice account addresses', async () => {
        const result = await AddressModel.query()
          .findById(testRecord.addressId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).to.be.instanceOf(AddressModel)
        expect(result.addressId).to.equal(testRecord.addressId)

        expect(result.invoiceAccountAddresses).to.be.an.array()
        expect(result.invoiceAccountAddresses[0]).to.be.an.instanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddresses).to.include(testInvoiceAccountAddresses[0])
        expect(result.invoiceAccountAddresses).to.include(testInvoiceAccountAddresses[1])
      })
    })
  })
})
