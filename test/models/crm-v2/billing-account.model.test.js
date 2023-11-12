'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountAddressHelper = require('../../support/helpers/crm-v2/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../../app/models/crm-v2/billing-account-address.model.js')
const BillingAccountHelper = require('../../support/helpers/crm-v2/billing-account.helper.js')
const CompanyHelper = require('../../support/helpers/crm-v2/company.helper.js')
const CompanyModel = require('../../../app/models/crm-v2/company.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const BillingAccountModel = require('../../../app/models/crm-v2/billing-account.model.js')

describe('Billing Account model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillingAccountHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillingAccountModel.query().findById(testRecord.invoiceAccountId)

      expect(result).to.be.an.instanceOf(BillingAccountModel)
      expect(result.invoiceAccountId).to.equal(testRecord.invoiceAccountId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company', () => {
      let testCompany

      beforeEach(async () => {
        testCompany = await CompanyHelper.add()
        testRecord = await BillingAccountHelper.add({ companyId: testCompany.companyId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query()
          .innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await BillingAccountModel.query()
          .findById(testRecord.invoiceAccountId)
          .withGraphFetched('company')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.invoiceAccountId).to.equal(testRecord.invoiceAccountId)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })

    describe('when linking to billing account addresses', () => {
      let testBillingAccountAddresses

      beforeEach(async () => {
        testRecord = await BillingAccountHelper.add()
        const { invoiceAccountId } = testRecord

        testBillingAccountAddresses = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
          // invoiceAccountId and start date
          const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
          const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, invoiceAccountId })
          testBillingAccountAddresses.push(billingAccountAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query()
          .innerJoinRelated('billingAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await BillingAccountModel.query()
          .findById(testRecord.invoiceAccountId)
          .withGraphFetched('billingAccountAddresses')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.invoiceAccountId).to.equal(testRecord.invoiceAccountId)

        expect(result.billingAccountAddresses).to.be.an.array()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[1])
      })
    })
  })
})
