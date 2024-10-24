'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../support/helpers/bill.helper.js')
const BillModel = require('../../app/models/bill.model.js')
const BillingAccountAddressHelper = require('../support/helpers/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../app/models/billing-account-address.model.js')
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')

// Thing under test
const BillingAccountModel = require('../../app/models/billing-account.model.js')

describe('Billing Account model', () => {
  let testBillingAccountAddresses
  let testBills
  let testChargeVersions
  let testCompany
  let testRecord

  before(async () => {
    testCompany = await CompanyHelper.add()

    testRecord = await BillingAccountHelper.add({ companyId: testCompany.id })

    testBillingAccountAddresses = []
    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the invoice_account_addresses table means you cannot have 2 records with the same
      // billingAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 1) : new Date(2023, 9, 1)
      const endDate = i === 0 ? new Date(2023, 8, 31) : null
      const billingAccountAddress = await BillingAccountAddressHelper.add({
        billingAccountId: testRecord.id, endDate, startDate
      })

      testBillingAccountAddresses.push(billingAccountAddress)
    }

    testBills = []
    for (let i = 0; i < 2; i++) {
      const bill = await BillHelper.add({ billingAccountId: testRecord.id })

      testBills.push(bill)
    }

    testChargeVersions = []
    for (let i = 0; i < 2; i++) {
      const chargeVersion = await ChargeVersionHelper.add({ billingAccountId: testRecord.id })

      testChargeVersions.push(chargeVersion)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillingAccountModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillingAccountModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query()
          .innerJoinRelated('billingAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await BillingAccountModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccountAddresses')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccountAddresses).to.be.an.array()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[1])
      })
    })

    describe('when linking to bills', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query()
          .innerJoinRelated('bills')

        expect(query).to.exist()
      })

      it('can eager load the bills', async () => {
        const result = await BillingAccountModel.query()
          .findById(testRecord.id)
          .withGraphFetched('bills')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.bills).to.be.an.array()
        expect(result.bills[0]).to.be.an.instanceOf(BillModel)
        expect(result.bills).to.include(testBills[0])
        expect(result.bills).to.include(testBills[1])
      })
    })

    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query()
          .innerJoinRelated('chargeVersions')

        expect(query).to.exist()
      })

      it('can eager load the charge versions', async () => {
        const result = await BillingAccountModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeVersions')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersions).to.be.an.array()
        expect(result.chargeVersions[0]).to.be.an.instanceOf(ChargeVersionModel)
        expect(result.chargeVersions).to.include(testChargeVersions[0])
        expect(result.chargeVersions).to.include(testChargeVersions[1])
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await BillingAccountModel.query()
          .innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await BillingAccountModel.query()
          .findById(testRecord.id)
          .withGraphFetched('company')

        expect(result).to.be.instanceOf(BillingAccountModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })
  })
})
