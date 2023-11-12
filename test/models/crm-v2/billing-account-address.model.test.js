'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const AddressModel = require('../../../app/models/crm-v2/address.model.js')
const BillingAccountAddressHelper = require('../../support/helpers/crm-v2/billing-account-address.helper.js')
const BillingAccountHelper = require('../../support/helpers/crm-v2/billing-account.helper.js')
const BillingAccountModel = require('../../../app/models/crm-v2/billing-account.model.js')
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const ContactHelper = require('../../support/helpers/crm-v2/contact.helper.js')
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const BillingAccountAddressModel = require('../../../app/models/crm-v2/billing-account-address.model.js')

describe('Billing Account Address model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillingAccountAddressHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillingAccountAddressModel.query().findById(testRecord.invoiceAccountAddressId)

      expect(result).to.be.an.instanceOf(BillingAccountAddressModel)
      expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      let testAddress

      beforeEach(async () => {
        testAddress = await AddressHelper.add()
        testRecord = await BillingAccountAddressHelper.add({ addressId: testAddress.addressId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query()
          .innerJoinRelated('address')

        expect(query).to.exist()
      })

      it('can eager load the address', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('address')

        expect(result).to.be.instanceOf(BillingAccountAddressModel)
        expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)

        expect(result.address).to.be.an.instanceOf(AddressModel)
        expect(result.address).to.equal(testAddress)
      })
    })

    describe('when linking to company (agent)', () => {
      let testCompany

      beforeEach(async () => {
        testCompany = await CompanyHelper.add()
        testRecord = await BillingAccountAddressHelper.add({ agentCompanyId: testCompany.companyId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query()
          .innerJoinRelated('agentCompany')

        expect(query).to.exist()
      })

      it('can eager load the agent company', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('agentCompany')

        expect(result).to.be.instanceOf(BillingAccountAddressModel)
        expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)

        expect(result.agentCompany).to.be.an.instanceOf(CompanyModel)
        expect(result.agentCompany).to.equal(testCompany)
      })
    })

    describe('when linking to billing account', () => {
      let testBillingAccount

      beforeEach(async () => {
        testBillingAccount = await BillingAccountHelper.add()
        testRecord = await BillingAccountAddressHelper.add({ invoiceAccountId: testBillingAccount.invoiceAccountId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query()
          .innerJoinRelated('billingAccount')

        expect(query).to.exist()
      })

      it('can eager load the billing account', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('billingAccount')

        expect(result).to.be.instanceOf(BillingAccountAddressModel)
        expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)

        expect(result.billingAccount).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccount).to.equal(testBillingAccount)
      })
    })

    describe('when linking to contact', () => {
      let testContact

      beforeEach(async () => {
        testContact = await ContactHelper.add()
        testRecord = await BillingAccountAddressHelper.add({ contactId: testContact.contactId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountAddressModel.query()
          .innerJoinRelated('contact')

        expect(query).to.exist()
      })

      it('can eager load the contact', async () => {
        const result = await BillingAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('contact')

        expect(result).to.be.instanceOf(BillingAccountAddressModel)
        expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)

        expect(result.contact).to.be.an.instanceOf(ContactModel)
        expect(result.contact).to.equal(testContact)
      })
    })
  })
})
