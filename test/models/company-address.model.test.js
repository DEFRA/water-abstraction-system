'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const AddressHelper = require('../support/helpers/address.helper.js')
const AddressModel = require('../../app/models/address.model.js')
const CompanyAddressHelper = require('../support/helpers/company-address.helper.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const LicenceRoleHelper = require('../support/helpers/licence-role.helper.js')
const LicenceRoleModel = require('../../app/models/licence-role.model.js')

// Thing under test
const CompanyAddressModel = require('../../app/models/company-address.model.js')

describe('Company Address model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await CompanyAddressHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await CompanyAddressModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(CompanyAddressModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      let testAddress

      beforeEach(async () => {
        testAddress = await AddressHelper.add()

        const { id: addressId } = testAddress

        testRecord = await CompanyAddressHelper.add({ addressId })
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyAddressModel.query()
          .innerJoinRelated('address')

        expect(query).to.exist()
      })

      it('can eager load the address', async () => {
        const result = await CompanyAddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('address')

        expect(result).to.be.instanceOf(CompanyAddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.address).to.be.an.instanceOf(AddressModel)
        expect(result.address).to.equal(testAddress)
      })
    })

    describe('when linking to company', () => {
      let testCompany

      beforeEach(async () => {
        testCompany = await CompanyHelper.add()

        const { id: companyId } = testCompany

        testRecord = await CompanyAddressHelper.add({ companyId })
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyAddressModel.query()
          .innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await CompanyAddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('company')

        expect(result).to.be.instanceOf(CompanyAddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })

    describe('when linking to licence role', () => {
      let testLicenceRole

      beforeEach(async () => {
        testLicenceRole = await LicenceRoleHelper.select()

        const { id: licenceRoleId } = testLicenceRole

        testRecord = await CompanyAddressHelper.add({ licenceRoleId })
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyAddressModel.query()
          .innerJoinRelated('licenceRole')

        expect(query).to.exist()
      })

      it('can eager load the licence role', async () => {
        const result = await CompanyAddressModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceRole')

        expect(result).to.be.instanceOf(CompanyAddressModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceRole).to.be.an.instanceOf(LicenceRoleModel)
        expect(result.licenceRole).to.equal(testLicenceRole, { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })
})
