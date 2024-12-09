'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const ContactHelper = require('../support/helpers/contact.helper.js')
const ContactModel = require('../../app/models/contact.model.js')
const LicenceRoleHelper = require('../support/helpers/licence-role.helper.js')
const LicenceRoleModel = require('../../app/models/licence-role.model.js')

// Thing under test
const CompanyContactModel = require('../../app/models/company-contact.model.js')

describe('Company Contacts model', () => {
  let testCompany
  let testContact
  let testLicenceRole
  let testRecord

  before(async () => {
    // Link licence role
    testLicenceRole = await LicenceRoleHelper.select()
    const { id: licenceRoleId } = testLicenceRole

    // Link contact
    testContact = await ContactHelper.add()
    const { id: contactId } = testContact

    // Link company
    testCompany = await CompanyHelper.add()
    const { id: companyId } = testCompany

    // Test record
    testRecord = await CompanyContactHelper.add({ companyId, contactId, licenceRoleId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await CompanyContactModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(CompanyContactModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('company')

        expect(query).to.exist()
      })

      it('can eager load the company', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('company')

        expect(result).to.be.instanceOf(CompanyContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.company).to.be.an.instanceOf(CompanyModel)
        expect(result.company).to.equal(testCompany)
      })
    })

    describe('when linking to contact', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('contact')

        expect(query).to.exist()
      })

      it('can eager load the contact', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('contact')

        expect(result).to.be.instanceOf(CompanyContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.contact).to.be.an.instanceOf(ContactModel)
        expect(result.contact).to.equal(testContact)
      })
    })

    describe('when linking to licence role', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('licenceRole')

        expect(query).to.exist()
      })

      it('can eager load the licence role', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('licenceRole')

        expect(result).to.be.instanceOf(CompanyContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceRole).to.be.an.instanceOf(LicenceRoleModel)
        expect(result.licenceRole).to.equal(testLicenceRole, { skip: ['createdAt', 'updatedAt'] })
      })
    })
  })
})
