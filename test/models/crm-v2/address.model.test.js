'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const BillingAccountAddressHelper = require('../../support/helpers/crm-v2/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../../app/models/crm-v2/billing-account-address.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

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
    describe('when linking to billing account addresses', () => {
      let testBillingAccountAddresses

      beforeEach(async () => {
        testRecord = await AddressHelper.add()
        const { addressId } = testRecord

        testBillingAccountAddresses = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
          // invoiceAccountId and start date
          const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
          const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, addressId })
          testBillingAccountAddresses.push(billingAccountAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await AddressModel.query()
          .innerJoinRelated('billingAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await AddressModel.query()
          .findById(testRecord.addressId)
          .withGraphFetched('billingAccountAddresses')

        expect(result).to.be.instanceOf(AddressModel)
        expect(result.addressId).to.equal(testRecord.addressId)

        expect(result.billingAccountAddresses).to.be.an.array()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[1])
      })
    })
  })
})
