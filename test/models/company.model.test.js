'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountAddressHelper = require('../support/helpers/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../app/models/billing-account-address.model.js')
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../app/models/billing-account.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const DatabaseHelper = require('../support/helpers/database.helper.js')

// Thing under test
const CompanyModel = require('../../app/models/company.model.js')

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
      const result = await CompanyModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(CompanyModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      let testBillingAccountAddresses

      beforeEach(async () => {
        testRecord = await CompanyHelper.add()
        const { id: companyId } = testRecord

        testBillingAccountAddresses = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
          // invoiceAccountId and start date
          const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
          const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, companyId })
          testBillingAccountAddresses.push(billingAccountAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query()
          .innerJoinRelated('billingAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await CompanyModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccountAddresses')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccountAddresses).to.be.an.array()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[1])
      })
    })

    describe('when linking to billing accounts', () => {
      let testBillingAccounts

      beforeEach(async () => {
        testRecord = await CompanyHelper.add()
        const { id: companyId } = testRecord

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
          .findById(testRecord.id)
          .withGraphFetched('billingAccounts')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccounts).to.be.an.array()
        expect(result.billingAccounts[0]).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccounts).to.include(testBillingAccounts[0])
        expect(result.billingAccounts).to.include(testBillingAccounts[1])
      })
    })
  })
})
