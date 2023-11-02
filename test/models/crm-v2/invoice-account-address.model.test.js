'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const AddressModel = require('../../../app/models/crm-v2/address.model.js')
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const ContactHelper = require('../../support/helpers/crm-v2/contact.helper.js')
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const InvoiceAccountModel = require('../../../app/models/crm-v2/invoice-account.model.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')

// Thing under test
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

describe('Invoice Account Address model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await InvoiceAccountAddressHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await InvoiceAccountAddressModel.query().findById(testRecord.invoiceAccountAddressId)

      expect(result).to.be.an.instanceOf(InvoiceAccountAddressModel)
      expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      let testAddress

      beforeEach(async () => {
        testAddress = await AddressHelper.add()
        testRecord = await InvoiceAccountAddressHelper.add({ addressId: testAddress.addressId })
      })

      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountAddressModel.query()
          .innerJoinRelated('address')

        expect(query).to.exist()
      })

      it('can eager load the address', async () => {
        const result = await InvoiceAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('address')

        expect(result).to.be.instanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)

        expect(result.address).to.be.an.instanceOf(AddressModel)
        expect(result.address).to.equal(testAddress)
      })
    })

    describe('when linking to company (agent)', () => {
      let testCompany

      beforeEach(async () => {
        testCompany = await CompanyHelper.add()
        testRecord = await InvoiceAccountAddressHelper.add({ agentCompanyId: testCompany.companyId })
      })

      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountAddressModel.query()
          .innerJoinRelated('agentCompany')

        expect(query).to.exist()
      })

      it('can eager load the agent company', async () => {
        const result = await InvoiceAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('agentCompany')

        expect(result).to.be.instanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)

        expect(result.agentCompany).to.be.an.instanceOf(CompanyModel)
        expect(result.agentCompany).to.equal(testCompany)
      })
    })

    describe('when linking to contact', () => {
      let testContact

      beforeEach(async () => {
        testContact = await ContactHelper.add()
        testRecord = await InvoiceAccountAddressHelper.add({ contactId: testContact.contactId })
      })

      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountAddressModel.query()
          .innerJoinRelated('contact')

        expect(query).to.exist()
      })

      it('can eager load the contact', async () => {
        const result = await InvoiceAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('contact')

        expect(result).to.be.instanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)

        expect(result.contact).to.be.an.instanceOf(ContactModel)
        expect(result.contact).to.equal(testContact)
      })
    })

    describe('when linking to invoice account', () => {
      let testInvoiceAccount

      beforeEach(async () => {
        testInvoiceAccount = await InvoiceAccountHelper.add()
        testRecord = await InvoiceAccountAddressHelper.add({ invoiceAccountId: testInvoiceAccount.invoiceAccountId })
      })

      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountAddressModel.query()
          .innerJoinRelated('invoiceAccount')

        expect(query).to.exist()
      })

      it('can eager load the region', async () => {
        const result = await InvoiceAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('invoiceAccount')

        expect(result).to.be.instanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddressId).to.equal(testRecord.invoiceAccountAddressId)

        expect(result.invoiceAccount).to.be.an.instanceOf(InvoiceAccountModel)
        expect(result.invoiceAccount).to.equal(testInvoiceAccount)
      })
    })
  })
})
