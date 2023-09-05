'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const InvoiceAccountModel = require('../../../app/models/crm-v2/invoice-account.model.js')

describe('Invoice Account model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await InvoiceAccountHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await InvoiceAccountModel.query().findById(testRecord.invoiceAccountId)

      expect(result).to.be.an.instanceOf(InvoiceAccountModel)
      expect(result.invoiceAccountId).to.equal(testRecord.invoiceAccountId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company', () => {
      let testCompany

      beforeEach(async () => {
        testCompany = await CompanyHelper.add()
        testRecord = await InvoiceAccountHelper.add({ companyId: testCompany.companyId })
      })

      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountModel.query()
          .innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await InvoiceAccountModel.query()
          .findById(testRecord.invoiceAccountId)
          .withGraphFetched('company')

        expect(result).to.be.instanceOf(InvoiceAccountModel)
        expect(result.invoiceAccountId).to.equal(testRecord.invoiceAccountId)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })

    describe('when linking to invoice account addresses', () => {
      let testInvoiceAccountAddresses

      beforeEach(async () => {
        testRecord = await InvoiceAccountHelper.add()
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

      it('can successfully run a related query', async () => {
        const query = await InvoiceAccountModel.query()
          .innerJoinRelated('invoiceAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the invoice account addresses', async () => {
        const result = await InvoiceAccountModel.query()
          .findById(testRecord.invoiceAccountId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).to.be.instanceOf(InvoiceAccountModel)
        expect(result.invoiceAccountId).to.equal(testRecord.invoiceAccountId)

        expect(result.invoiceAccountAddresses).to.be.an.array()
        expect(result.invoiceAccountAddresses[0]).to.be.an.instanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddresses).to.include(testInvoiceAccountAddresses[0])
        expect(result.invoiceAccountAddresses).to.include(testInvoiceAccountAddresses[1])
      })
    })
  })
})
