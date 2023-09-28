'use strict'

// Test helpers
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const InvoiceAccountModel = require('../../../app/models/crm-v2/invoice-account.model.js')

describe('Invoice Account model', () => {
  let testCompany
  let testInvoiceAccountAddresses
  let testRecord

  beforeAll(async () => {
    testCompany = await CompanyHelper.add()
    testRecord = await InvoiceAccountHelper.add({ companyId: testCompany.companyId })

    const { invoiceAccountId } = testRecord

    testInvoiceAccountAddresses = []
    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
      // invoiceAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const invoiceAccountAddress = await InvoiceAccountAddressHelper.add({ startDate, invoiceAccountId })
      testInvoiceAccountAddresses.push(invoiceAccountAddress)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await InvoiceAccountModel.query().findById(testRecord.invoiceAccountId)

      expect(result).toBeInstanceOf(InvoiceAccountModel)
      expect(result.invoiceAccountId).toBe(testRecord.invoiceAccountId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountModel.query()
          .innerJoinRelated('company')

        expect(query).toBeTruthy()
      })

      it('can eager load the company', async () => {
        const result = await InvoiceAccountModel.query()
          .findById(testRecord.invoiceAccountId)
          .withGraphFetched('company')

        expect(result).toBeInstanceOf(InvoiceAccountModel)
        expect(result.invoiceAccountId).toBe(testRecord.invoiceAccountId)

        expect(result.company).toBeInstanceOf(CompanyModel)
        expect(result.company).toEqual(testCompany)
      })
    })

    describe('when linking to invoice account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountModel.query()
          .innerJoinRelated('invoiceAccountAddresses')

        expect(query).toBeTruthy()
      })

      it('can eager load the invoice account addresses', async () => {
        const result = await InvoiceAccountModel.query()
          .findById(testRecord.invoiceAccountId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).toBeInstanceOf(InvoiceAccountModel)
        expect(result.invoiceAccountId).toBe(testRecord.invoiceAccountId)

        expect(result.invoiceAccountAddresses).toBeInstanceOf(Array)
        expect(result.invoiceAccountAddresses[0]).toBeInstanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddresses).toContainEqual(testInvoiceAccountAddresses[0])
        expect(result.invoiceAccountAddresses).toContainEqual(testInvoiceAccountAddresses[1])
      })
    })
  })
})
