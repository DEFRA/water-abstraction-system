'use strict'

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
  let testAddress
  let testCompany
  let testContact
  let testLicenceDocument
  let testLicenceRole
  let testRecord

  beforeAll(async () => {
    // Link address
    testAddress = await AddressHelper.add()

    // Link company
    testCompany = await CompanyHelper.add()

    // Link contact
    testContact = await ContactHelper.add()

    // Link licence document
    testLicenceDocument = await LicenceDocumentHelper.add()

    // Link licence role
    testLicenceRole = await LicenceRoleHelper.select()

    // Test record
    testRecord = await LicenceDocumentRoleHelper.add({
      addressId: testAddress.id,
      companyId: testCompany.id,
      contactId: testContact.id,
      licenceDocumentId: testLicenceDocument.id,
      licenceRoleId: testLicenceRole.id
    })
  })

  afterAll(async () => {
    await testAddress.$query().delete()
    await testCompany.$query().delete()
    await testContact.$query().delete()
    await testLicenceDocument.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentRoleModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceDocumentRoleModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to address', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('address')

        expect(query).toBeDefined()
      })

      it('can eager load the address', async () => {
        const result = await LicenceDocumentRoleModel.query().findById(testRecord.id).withGraphFetched('address')

        expect(result).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.address).toBeInstanceOf(AddressModel)
        expect(result.address).toEqual(testAddress)
      })
    })

    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('company')

        expect(query).toBeDefined()
      })

      it('can eager load the company', async () => {
        const result = await LicenceDocumentRoleModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.company).toBeInstanceOf(CompanyModel)
        expect(result.company).toEqual(testCompany)
      })
    })

    describe('when linking to contact', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('contact')

        expect(query).toBeDefined()
      })

      it('can eager load the contact', async () => {
        const result = await LicenceDocumentRoleModel.query().findById(testRecord.id).withGraphFetched('contact')

        expect(result).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.contact).toBeInstanceOf(ContactModel)
        expect(result.contact).toEqual(testContact)
      })
    })

    describe('when linking to licence document', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('licenceDocument')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document', async () => {
        const result = await LicenceDocumentRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocument')

        expect(result).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocument).toBeInstanceOf(LicenceDocumentModel)
        expect(result.licenceDocument).toEqual(testLicenceDocument)
      })
    })

    describe('when linking to licence role', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query().innerJoinRelated('licenceRole')

        expect(query).toBeDefined()
      })

      it('can eager load the licence role', async () => {
        const result = await LicenceDocumentRoleModel.query().findById(testRecord.id).withGraphFetched('licenceRole')

        expect(result).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.licenceRole).toBeInstanceOf(LicenceRoleModel)
        expect(result.licenceRole).toMatchObject(testLicenceRole)
      })
    })
  })
})
