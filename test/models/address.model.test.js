'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const AddressHelper = require('../support/helpers/address.helper.js')
const BillingAccountAddressHelper = require('../support/helpers/billing-account-address.helper.js')
const BillingAccountAddressModel = require('../../app/models/billing-account-address.model.js')
const CompanyAddressHelper = require('../support/helpers/company-address.helper.js')
const CompanyAddressModel = require('../../app/models/company-address.model.js')
const DatabaseSupport = require('../support/database.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceDocumentRoleModel = require('../../app/models/licence-document-role.model.js')

// Thing under test
const AddressModel = require('../../app/models/address.model.js')

describe('Address model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await AddressHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await AddressModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(AddressModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      let testBillingAccountAddresses

      beforeEach(async () => {
        testRecord = await AddressHelper.add()
        const { id: addressId } = testRecord

        testBillingAccountAddresses = []
        for (let i = 0; i < 2; i++) {
          // NOTE: A constraint in the billing_account_addresses table means you cannot have 2 records with the same
          // billingAccountId and start date
          const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
          const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, addressId })
          testBillingAccountAddresses.push(billingAccountAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await AddressModel.query()
          .innerJoinRelated('billingAccountAddresses')

        expect(query).to.exist()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await AddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('billingAccountAddresses')

        expect(result).to.be.instanceOf(AddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billingAccountAddresses).to.be.an.array()
        expect(result.billingAccountAddresses[0]).to.be.an.instanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).to.include(testBillingAccountAddresses[1])
      })
    })

    describe('when linking to company addresses', () => {
      let testCompanyAddresses

      beforeEach(async () => {
        testRecord = await AddressHelper.add()

        const { id: addressId } = testRecord

        testCompanyAddresses = []
        for (let i = 0; i < 2; i++) {
          const companyAddress = await CompanyAddressHelper.add({ addressId })
          testCompanyAddresses.push(companyAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await AddressModel.query()
          .innerJoinRelated('companyAddresses')

        expect(query).to.exist()
      })

      it('can eager load the company addresses', async () => {
        const result = await AddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('companyAddresses')

        expect(result).to.be.instanceOf(AddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyAddresses).to.be.an.array()
        expect(result.companyAddresses[0]).to.be.an.instanceOf(CompanyAddressModel)
        expect(result.companyAddresses).to.include(testCompanyAddresses[0])
        expect(result.companyAddresses).to.include(testCompanyAddresses[1])
      })
    })

    describe('when linking to licence document roles', () => {
      let testLicenceDocumentRoles

      beforeEach(async () => {
        testRecord = await AddressHelper.add()

        const { id: addressId } = testRecord

        testLicenceDocumentRoles = []
        for (let i = 0; i < 2; i++) {
          const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ addressId })
          testLicenceDocumentRoles.push(licenceDocumentRole)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await AddressModel.query()
          .innerJoinRelated('licenceDocumentRoles')

        expect(query).to.exist()
      })

      it('can eager load the licence document roles', async () => {
        const result = await AddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentRoles')

        expect(result).to.be.instanceOf(AddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentRoles).to.be.an.array()
        expect(result.licenceDocumentRoles[0]).to.be.an.instanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[1])
      })
    })
  })
})
