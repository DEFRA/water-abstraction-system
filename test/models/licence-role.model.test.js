'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyAddressHelper = require('../support/helpers/company-address.helper.js')
const CompanyAddressModel = require('../../app/models/company-address.model.js')
const CompanyContactHelper = require('../support/helpers/company-contact.helper.js')
const CompanyContactModel = require('../../app/models/company-contact.model.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceDocumentRoleModel = require('../../app/models/licence-document-role.model.js')
const LicenceRoleHelper = require('../support/helpers/licence-role.helper.js')

// Thing under test
const LicenceRoleModel = require('../../app/models/licence-role.model.js')

describe('Licence Role model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceRoleHelper.select()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company addresses', () => {
      let testCompanyAddresses

      beforeEach(async () => {
        testRecord = await LicenceRoleHelper.select()

        const { id: licenceRoleId } = testRecord

        testCompanyAddresses = []
        for (let i = 0; i < 2; i++) {
          const companyAddress = await CompanyAddressHelper.add({ licenceRoleId })

          testCompanyAddresses.push(companyAddress)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceRoleModel.query().innerJoinRelated('companyAddresses')

        expect(query).to.exist()
      })

      it('can eager load the company addresses', async () => {
        const result = await LicenceRoleModel.query().findById(testRecord.id).withGraphFetched('companyAddresses')

        expect(result).to.be.instanceOf(LicenceRoleModel)
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
        testRecord = await LicenceRoleHelper.select()

        const { id: licenceRoleId } = testRecord

        testCompanyContacts = []
        for (let i = 0; i < 2; i++) {
          const companyContact = await CompanyContactHelper.add({ licenceRoleId })

          testCompanyContacts.push(companyContact)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceRoleModel.query().innerJoinRelated('companyContacts')

        expect(query).to.exist()
      })

      it('can eager load the company contacts', async () => {
        const result = await LicenceRoleModel.query().findById(testRecord.id).withGraphFetched('companyContacts')

        expect(result).to.be.instanceOf(LicenceRoleModel)
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
        testRecord = await LicenceRoleHelper.select()

        const { id: licenceRoleId } = testRecord

        testLicenceDocumentRoles = []
        for (let i = 0; i < 2; i++) {
          const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ licenceRoleId })

          testLicenceDocumentRoles.push(licenceDocumentRole)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceRoleModel.query().innerJoinRelated('licenceDocumentRoles')

        expect(query).to.exist()
      })

      it('can eager load the licence document roles', async () => {
        const result = await LicenceRoleModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentRoles')

        expect(result).to.be.instanceOf(LicenceRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentRoles).to.be.an.array()
        expect(result.licenceDocumentRoles[0]).to.be.an.instanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[1])
      })
    })
  })
})
