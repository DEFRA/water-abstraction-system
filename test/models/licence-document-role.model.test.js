'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../support/helpers/address.helper.js')
const AddressModel = require('../../app/models/address.model.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const ContactHelper = require('../support/helpers/contact.helper.js')
const ContactModel = require('../../app/models/contact.model.js')
const LicenceDocumentHelper = require('../support/helpers/licence-document.helper.js')
const LicenceDocumentModel = require('../../app/models/licence-document.model.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceRoleHelper = require('../support/helpers/licence-role.helper.js')
const LicenceRoleModel = require('../../app/models/licence-role.model.js')

// Thing under test
const LicenceDocumentRoleModel = require('../../app/models/licence-document-role.model.js')

describe('Licence Document Role model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceDocumentRoleHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      let testAddress

      beforeEach(async () => {
        testAddress = await AddressHelper.add()

        const { id: addressId } = testAddress

        testRecord = await LicenceDocumentRoleHelper.add({ addressId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('address')

        expect(query).to.exist()
      })

      it('can eager load the address', async () => {
        const result = await LicenceDocumentRoleModel.query().findById(testRecord.id).withGraphFetched('address')

        expect(result).to.be.instanceOf(LicenceDocumentRoleModel)
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

        testRecord = await LicenceDocumentRoleHelper.add({ companyId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await LicenceDocumentRoleModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).to.be.instanceOf(LicenceDocumentRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })

    describe('when linking to contact', () => {
      let testContact

      beforeEach(async () => {
        testContact = await ContactHelper.add()

        const { id: contactId } = testContact

        testRecord = await LicenceDocumentRoleHelper.add({ contactId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('contact')

        expect(query).to.exist()
      })

      it('can eager load the contact', async () => {
        const result = await LicenceDocumentRoleModel.query().findById(testRecord.id).withGraphFetched('contact')

        expect(result).to.be.instanceOf(LicenceDocumentRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.contact).to.be.an.instanceOf(ContactModel)
        expect(result.contact).to.equal(testContact)
      })
    })

    describe('when linking to licence document', () => {
      let testLicenceDocument

      beforeEach(async () => {
        testLicenceDocument = await LicenceDocumentHelper.add()

        const { id: licenceDocumentId } = testLicenceDocument

        testRecord = await LicenceDocumentRoleHelper.add({ licenceDocumentId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('licenceDocument')

        expect(query).to.exist()
      })

      it('can eager load the licence document', async () => {
        const result = await LicenceDocumentRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocument')

        expect(result).to.be.instanceOf(LicenceDocumentRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocument).to.be.an.instanceOf(LicenceDocumentModel)
        expect(result.licenceDocument).to.equal(testLicenceDocument)
      })
    })

    describe('when linking to licence role', () => {
      let testLicenceRole

      beforeEach(async () => {
        testLicenceRole = await LicenceRoleHelper.select()

        const { id: licenceRoleId } = testLicenceRole

        testRecord = await LicenceDocumentRoleHelper.add({ licenceRoleId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('licenceRole')

        expect(query).to.exist()
      })

      it('can eager load the licence role', async () => {
        const result = await LicenceDocumentRoleModel.query().findById(testRecord.id).withGraphFetched('licenceRole')

        expect(result).to.be.instanceOf(LicenceDocumentRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceRole).to.be.an.instanceOf(LicenceRoleModel)
        expect(result.licenceRole).to.equal(testLicenceRole, { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })
})
