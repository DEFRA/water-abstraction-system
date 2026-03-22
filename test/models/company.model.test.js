'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
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
const LicenceVersionHolderHelper = require('../support/helpers/licence-version-holder.helper.js')
const LicenceVersionHolderModel = require('../../app/models/licence-version-holder.model.js')
const LicenceVersionHelper = require('../support/helpers/licence-version.helper.js')
const LicenceVersionModel = require('../../app/models/licence-version.model.js')
const RegionHelper = require('../support/helpers/region.helper.js')
const RegionModel = require('../../app/models/region.model.js')

// Thing under test
const CompanyModel = require('../../app/models/company.model.js')

describe('Company model', () => {
  let billingAccountAddresses
  let billingAccounts
  let companyAddresses
  let companyContacts
  let licenceDocumentRoles
  let licenceVersionHolders
  let licenceVersions
  let region
  let testRecord

  before(async () => {
    region = RegionHelper.select()

    // Test record
    testRecord = await CompanyHelper.add({ regionId: region.id })
    const { id: companyId } = testRecord

    billingAccountAddresses = []
    billingAccounts = []
    companyAddresses = []
    companyContacts = []
    licenceDocumentRoles = []
    licenceVersionHolders = []
    licenceVersions = []

    for (let i = 0; i < 2; i++) {
      // Link billing account addresses

      // NOTE: A constraint in the billing_account_addresses table means you cannot have 2 records with the same
      // billingAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, companyId })

      billingAccountAddresses.push(billingAccountAddress)

      // Link billing accounts
      const billingAccount = await BillingAccountHelper.add({ companyId })

      billingAccounts.push(billingAccount)

      // Link company addresses
      const companyAddress = await CompanyAddressHelper.add({ companyId })

      companyAddresses.push(companyAddress)

      // Link company contacts
      const companyContact = await CompanyContactHelper.add({ companyId })

      companyContacts.push(companyContact)

      // Link licence document roles
      const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ companyId })

      licenceDocumentRoles.push(licenceDocumentRole)

      // Link licence version holders
      const licenceVersionHolder = await LicenceVersionHolderHelper.add({ companyId })

      licenceVersionHolders.push(licenceVersionHolder)

      // Link licence versions
      const licenceVersion = await LicenceVersionHelper.add({ companyId })

      licenceVersions.push(licenceVersion)
    }
  })

  after(async () => {
    for (const licenceVersion of licenceVersions) {
      await licenceVersion.$query().delete()
    }

    for (const licenceVersionHolder of licenceVersionHolders) {
      await licenceVersionHolder.$query().delete()
    }

    for (const licenceDocumentRole of licenceDocumentRoles) {
      await licenceDocumentRole.$query().delete()
    }

    for (const companyContact of companyContacts) {
      await companyContact.$query().delete()
    }

    for (const companyAddress of companyAddresses) {
      await companyAddress.$query().delete()
    }

    for (const billingAccount of billingAccounts) {
      await billingAccount.$query().delete()
    }

    for (const billingAccountAddress of billingAccountAddresses) {
      await billingAccountAddress.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await CompanyModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(CompanyModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('billingAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('billingAccountAddresses')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccountAddresses).to.be.an.array()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).to.include(billingAccountAddresses[0])
        expect(result.billingAccountAddresses).to.include(billingAccountAddresses[1])
      })
    })

    describe('when linking to billing accounts', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('billingAccounts')

        expect(query).to.exist()
      })

      it('can eager load the billing accounts', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('billingAccounts')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccounts).to.be.an.array()
        expect(result.billingAccounts[0]).to.be.an.instanceOf(BillingAccountModel)
        expect(result.billingAccounts).to.include(billingAccounts[0])
        expect(result.billingAccounts).to.include(billingAccounts[1])
      })
    })

    describe('when linking to company addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('companyAddresses')

        expect(query).to.exist()
      })

      it('can eager load the company addresses', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('companyAddresses')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyAddresses).to.be.an.array()
        expect(result.companyAddresses[0]).to.be.an.instanceOf(CompanyAddressModel)
        expect(result.companyAddresses).to.include(companyAddresses[0])
        expect(result.companyAddresses).to.include(companyAddresses[1])
      })
    })

    describe('when linking to company contacts', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('companyContacts')

        expect(query).to.exist()
      })

      it('can eager load the company contacts', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('companyContacts')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyContacts).to.be.an.array()
        expect(result.companyContacts[0]).to.be.an.instanceOf(CompanyContactModel)
        expect(result.companyContacts).to.include(companyContacts[0])
        expect(result.companyContacts).to.include(companyContacts[1])
      })
    })

    describe('when linking to licence document roles', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('licenceDocumentRoles')

        expect(query).to.exist()
      })

      it('can eager load the licence document roles', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentRoles')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentRoles).to.be.an.array()
        expect(result.licenceDocumentRoles[0]).to.be.an.instanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).to.include(licenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).to.include(licenceDocumentRoles[1])
      })
    })

    describe('when linking to licence version holders', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('licenceVersionHolders')

        expect(query).to.exist()
      })

      it('can eager load the licence version holders', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('licenceVersionHolders')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersionHolders).to.be.an.array()
        expect(result.licenceVersionHolders[0]).to.be.an.instanceOf(LicenceVersionHolderModel)
        expect(result.licenceVersionHolders).to.include(licenceVersionHolders[0])
        expect(result.licenceVersionHolders).to.include(licenceVersionHolders[1])
      })
    })

    describe('when linking to licence versions', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('licenceVersions')

        expect(query).to.exist()
      })

      it('can eager load the licence versions', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('licenceVersions')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceVersions).to.be.an.array()
        expect(result.licenceVersions[0]).to.be.an.instanceOf(LicenceVersionModel)
        expect(result.licenceVersions).to.include(licenceVersions[0])
        expect(result.licenceVersions).to.include(licenceVersions[1])
      })
    })

    describe('when linking to region', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyModel.query().innerJoinRelated('region')

        expect(query).to.exist()
      })

      it('can eager load the region', async () => {
        const result = await CompanyModel.query().findById(testRecord.id).withGraphFetched('region')

        expect(result).to.be.instanceOf(CompanyModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.region).to.be.an.instanceOf(RegionModel)
        expect(result.region).to.equal(region, { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })
})
