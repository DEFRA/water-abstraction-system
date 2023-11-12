'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../support/helpers/crm-v2/billing-account.helper.js')
const BillingAccountModel = require('../../../app/models/crm-v2/billing-account.model.js')
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const InvoiceAccountAddressHelper = require('../../support/helpers/crm-v2/invoice-account-address.helper.js')
const InvoiceAccountAddressModel = require('../../../app/models/crm-v2/invoice-account-address.model.js')

// Thing under test
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')

describe('Company model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await CompanyHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await CompanyModel.query().findById(testRecord.companyId)

      expect(result).to.be.an.instanceOf(CompanyModel)
      expect(result.companyId).to.equal(testRecord.companyId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing accounts', () => {
      let testBillingAccounts

      beforeEach(async () => {
        testRecord = await CompanyHelper.add()
        const { companyId } = testRecord

        testBillingAccounts = []
        for (let i = 0; i < 2; i++) {
          const billingAccount = await BillingAccountHelper.add({ companyId })
          testBillingAccounts.push(billingAccount)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query()
          .innerJoinRelated('billingAccounts')

        expect(query).to.exist()
      })

      it('can eager load the billing accounts', async () => {
        const result = await CompanyModel.query()
          .findById(testRecord.companyId)
          .withGraphFetched('billingAccounts')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.companyId).to.equal(testRecord.companyId)

        expect(result.billingAccounts).to.be.an.array()
        expect(result.billingAccounts[0]).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccounts).to.include(testBillingAccounts[0])
        expect(result.billingAccounts).to.include(testBillingAccounts[1])
      })
    })

    describe('when linking to invoice account addresses', () => {
      let testInvoiceAccountAddresses

      beforeEach(async () => {
        testRecord = await CompanyHelper.add()
        const { companyId: agentCompanyId } = testRecord

        testInvoiceAccountAddresses = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
          // invoiceAccountId and start date
          const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
          const invoiceAccountAddress = await InvoiceAccountAddressHelper.add({ startDate, agentCompanyId })
          testInvoiceAccountAddresses.push(invoiceAccountAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query()
          .innerJoinRelated('invoiceAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the invoice account addresses', async () => {
        const result = await CompanyModel.query()
          .findById(testRecord.companyId)
          .withGraphFetched('invoiceAccountAddresses')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.companyId).to.equal(testRecord.companyId)

        expect(result.invoiceAccountAddresses).to.be.an.array()
        expect(result.invoiceAccountAddresses[0]).to.be.an.instanceOf(InvoiceAccountAddressModel)
        expect(result.invoiceAccountAddresses).to.include(testInvoiceAccountAddresses[0])
        expect(result.invoiceAccountAddresses).to.include(testInvoiceAccountAddresses[1])
      })
    })
  })
})
