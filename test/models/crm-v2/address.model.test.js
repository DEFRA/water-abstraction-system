'use strict'

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const AddressModel = require('../../../app/models/crm-v2/address.model.js')

describe('Address model', () => {
  let testRecord
  let testInvoiceAccountAddresses

  beforeAll(async () => {
    testRecord = await AddressHelper.add()
    testInvoiceAccountAddresses = []

    const { addressId } = testRecord

    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
      // invoiceAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const invoiceAccountAddress = await InvoiceAccountAddressHelper.add({ startDate, addressId })
      testInvoiceAccountAddresses.push(invoiceAccountAddress)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await AddressModel.query().findById(testRecord.addressId)

      expect(result).toBeInstanceOf(AddressModel)
      expect(result.addressId).toBe(testRecord.addressId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to invoice account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await AddressModel.query()
          .innerJoinRelated('invoiceAccountAddresses')

        expect(query).toBeTruthy()
      })

      it('can eager load the invoice account addresses', async () => {
        const result = await AddressModel.query()
          .findById(testRecord.addressId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).toBeInstanceOf(AddressModel)
        expect(result.addressId).toBe(testRecord.addressId)

        expect(result.invoiceAccountAddresses).toBeInstanceOf(Array)
        expect(result.invoiceAccountAddresses[0]).toBeInstanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddresses).toContainEqual(testInvoiceAccountAddresses[0])
        expect(result.invoiceAccountAddresses).toContainEqual(testInvoiceAccountAddresses[1])
      })
    })
  })
})
