'use strict'

// Test helpers
const AddressHelper = require('../../support/helpers/crm-v2/address.helper.js')
const AddressModel = require('../../../app/models/crm-v2/address.model.js')
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const ContactHelper = require('../../support/helpers/crm-v2/contact.helper.js')
const ContactModel = require('../../../app/models/crm-v2/contact.model.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const InvoiceAccountModel = require('../../../app/models/crm-v2/invoice-account.model.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')

// Thing under test
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

describe('Invoice Account Address model', () => {
  let testAddress
  let testCompany
  let testContact
  let testInvoiceAccount
  let testRecord

  beforeAll(async () => {
    testAddress = await AddressHelper.add()
    testCompany = await CompanyHelper.add()
    testContact = await ContactHelper.add()
    testInvoiceAccount = await InvoiceAccountHelper.add()

    testRecord = await InvoiceAccountAddressHelper.add({
      addressId: testAddress.addressId,
      agentCompanyId: testCompany.companyId,
      contactId: testContact.contactId,
      invoiceAccountId: testInvoiceAccount.invoiceAccountId
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await InvoiceAccountAddressModel.query().findById(testRecord.invoiceAccountAddressId)

      expect(result).toBeInstanceOf(InvoiceAccountAddressModel)
      expect(result.invoiceAccountAddressId).toBe(testRecord.invoiceAccountAddressId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountAddressModel.query()
          .innerJoinRelated('address')

        expect(query).toBeTruthy()
      })

      it('can eager load the address', async () => {
        const result = await InvoiceAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('address')

        expect(result).toBeInstanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddressId).toBe(testRecord.invoiceAccountAddressId)

        expect(result.address).toBeInstanceOf(AddressModel)
        expect(result.address).toEqual(testAddress)
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountAddressModel.query()
          .innerJoinRelated('company')

        expect(query).toBeTruthy()
      })

      it('can eager load the company', async () => {
        const result = await InvoiceAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('company')

        expect(result).toBeInstanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddressId).toBe(testRecord.invoiceAccountAddressId)

        expect(result.company).toBeInstanceOf(CompanyModel)
        expect(result.company).toEqual(testCompany)
      })
    })

    describe('when linking to contact', () => {
      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountAddressModel.query()
          .innerJoinRelated('contact')

        expect(query).toBeTruthy()
      })

      it('can eager load the contact', async () => {
        const result = await InvoiceAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('contact')

        expect(result).toBeInstanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddressId).toBe(testRecord.invoiceAccountAddressId)

        expect(result.contact).toBeInstanceOf(ContactModel)
        expect(result.contact).toEqual(testContact)
      })
    })

    describe('when linking to invoice account', () => {
      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountAddressModel.query()
          .innerJoinRelated('invoiceAccount')

        expect(query).toBeTruthy()
      })

      it('can eager load the region', async () => {
        const result = await InvoiceAccountAddressModel.query()
          .findById(testRecord.invoiceAccountAddressId)
          .withGraphFetched('invoiceAccount')

        expect(result).toBeInstanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddressId).toBe(testRecord.invoiceAccountAddressId)

        expect(result.invoiceAccount).toBeInstanceOf(InvoiceAccountModel)
        expect(result.invoiceAccount).toEqual(testInvoiceAccount)
      })
    })
  })
})
