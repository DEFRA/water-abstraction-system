'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const AddressHelper = require('../support/helpers/address.helper.js')
const AddressModel = require('../../app/models/address.model.js')
const BillingAccountAddressHelper = require('../support/helpers/billing-account-address.helper.js')
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../app/models/billing-account.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const ContactHelper = require('../support/helpers/contact.helper.js')
const ContactModel = require('../../app/models/contact.model.js')

// Thing under test
const BillingAccountAddressModel = require('../../app/models/billing-account-address.model.js')

describe('Billing Account Address model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillingAccountAddressHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillingAccountAddressModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillingAccountAddressModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      let testAddress

      beforeEach(async () => {
        testAddress = await AddressHelper.add()
        testRecord = await BillingAccountAddressHelper.add({ addressId: testAddress.id })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query()
          .innerJoinRelated('address')

        expect(query).to.exist()
      })

      it('can eager load the address', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('address')

        expect(result).to.be.instanceOf(BillingAccountAddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.address).to.be.an.instanceOf(AddressModel)
        expect(result.address).to.equal(testAddress)
      })
    })

    describe('when linking to company', () => {
      let testCompany

      beforeEach(async () => {
        testCompany = await CompanyHelper.add()
        testRecord = await BillingAccountAddressHelper.add({ companyId: testCompany.id })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query()
          .innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('company')

        expect(result).to.be.instanceOf(BillingAccountAddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })

    describe('when linking to billing account', () => {
      let testBillingAccount

      beforeEach(async () => {
        testBillingAccount = await BillingAccountHelper.add()
        testRecord = await BillingAccountAddressHelper.add({ billingAccountId: testBillingAccount.id })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query()
          .innerJoinRelated('billingAccount')

        expect(query).to.exist()
      })

      it('can eager load the billing account', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccount')

        expect(result).to.be.instanceOf(BillingAccountAddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccount).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccount).to.equal(testBillingAccount)
      })
    })

    describe('when linking to contact', () => {
      let testContact

      beforeEach(async () => {
        testContact = await ContactHelper.add()
        testRecord = await BillingAccountAddressHelper.add({ contactId: testContact.id })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query()
          .innerJoinRelated('contact')

        expect(query).to.exist()
      })

      it('can eager load the contact', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('contact')

        expect(result).to.be.instanceOf(BillingAccountAddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.contact).to.be.an.instanceOf(ContactModel)
        expect(result.contact).to.equal(testContact)
      })
    })
  })
})
