'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const BillingAccountAddressHelper = require('../support/helpers/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../app/models/billing-account-address.model.js')
const BillingAccountHelper = require('../support/helpers/billing-account.helper.js')
const BillingAccountModel = require('../../app/models/billing-account.model.js')
const CompanyAddressHelper = require('../support/helpers/company-address.helper.js')
const CompanyAddressModel = require('../../app/models/company-address.model.js')
const CompanyContactHelper = require('../support/helpers/company-contact.helper.js')
const CompanyContactModel = require('../../app/models/company-contact.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceDocumentRoleModel = require('../../app/models/licence-document-role.model.js')

// Thing under test
const CompanyModel = require('../../app/models/company.model.js')

describe('Company model', () => {
  let testRecord

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
          // NOTE: A constraint in the billing_account_addresses table means you cannot have 2 records with the same
          // billingAccountId and start date
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

    describe('when linking to company addresses', () => {
      let testCompanyAddresses

      beforeEach(async () => {
        testRecord = await CompanyHelper.add()

        const { id: companyId } = testRecord

        testCompanyAddresses = []
        for (let i = 0; i < 2; i++) {
          const companyAddress = await CompanyAddressHelper.add({ companyId })

          testCompanyAddresses.push(companyAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query()
          .innerJoinRelated('companyAddresses')

        expect(query).to.exist()
      })

      it('can eager load the company addresses', async () => {
        const result = await CompanyModel.query()
          .findById(testRecord.id)
          .withGraphFetched('companyAddresses')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyAddresses).to.be.an.array()
        expect(result.companyAddresses[0]).to.be.an.instanceOf(CompanyAddressModel)
        expect(result.companyAddresses).to.include(testCompanyAddresses[0])
        expect(result.companyAddresses).to.include(testCompanyAddresses[1])
      })
    })

    describe('when linking to company contacts', () => {
      let testCompanyContacts

      beforeEach(async () => {
        testRecord = await CompanyHelper.add()

        const { id: companyId } = testRecord

        testCompanyContacts = []
        for (let i = 0; i < 2; i++) {
          const companyContact = await CompanyContactHelper.add({ companyId })

          testCompanyContacts.push(companyContact)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query()
          .innerJoinRelated('companyContacts')

        expect(query).to.exist()
      })

      it('can eager load the company contacts', async () => {
        const result = await CompanyModel.query()
          .findById(testRecord.id)
          .withGraphFetched('companyContacts')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyContacts).to.be.an.array()
        expect(result.companyContacts[0]).to.be.an.instanceOf(CompanyContactModel)
        expect(result.companyContacts).to.include(testCompanyContacts[0])
        expect(result.companyContacts).to.include(testCompanyContacts[1])
      })
    })

    describe('when linking to licence document roles', () => {
      let testLicenceDocumentRoles

      beforeEach(async () => {
        testRecord = await CompanyHelper.add()

        const { id: companyId } = testRecord

        testLicenceDocumentRoles = []
        for (let i = 0; i < 2; i++) {
          const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ companyId })

          testLicenceDocumentRoles.push(licenceDocumentRole)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query()
          .innerJoinRelated('licenceDocumentRoles')

        expect(query).to.exist()
      })

      it('can eager load the licence document roles', async () => {
        const result = await CompanyModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentRoles')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentRoles).to.be.an.array()
        expect(result.licenceDocumentRoles[0]).to.be.an.instanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[1])
      })
    })
  })
})
