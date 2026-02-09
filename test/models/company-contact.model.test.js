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
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')

// Thing under test
const CompanyContactModel = require('../../app/models/company-contact.model.js')

describe('Company Contacts model', () => {
  let testCompany
  let testContact
  let testCreatedByUser
  let testLicenceRole
  let testRecord
  let testUpdatedByUser

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

    // Link to user for createdBy
    testCreatedByUser = await UserHelper.select(0)
    const { id: createdBy } = testCreatedByUser

    // Link to user for updatedBy
    testUpdatedByUser = await UserHelper.select(1)
    const { id: updatedBy } = testUpdatedByUser

    // Test record
    testRecord = await CompanyContactHelper.add({ companyId, contactId, createdBy, licenceRoleId, updatedBy })
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

    describe('when linking to created by user', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('createdByUser')

        expect(query).to.exist()
      })

      it('can eager load the created by user', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('createdByUser')

        expect(result).to.be.instanceOf(CompanyContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.createdByUser).to.be.an.instanceOf(UserModel)
        expect(result.createdByUser).to.equal(testCreatedByUser, {
          skip: ['createdAt', 'licenceEntityId', 'password', 'updatedAt', 'userData']
        })
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

    describe('when linking to updated by user', () => {
      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query().innerJoinRelated('updatedByUser')

        expect(query).to.exist()
      })

      it('can eager load the updated by user', async () => {
        const result = await CompanyContactModel.query().findById(testRecord.id).withGraphFetched('updatedByUser')

        expect(result).to.be.instanceOf(CompanyContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.updatedByUser).to.be.an.instanceOf(UserModel)
        expect(result.updatedByUser).to.equal(testUpdatedByUser, {
          skip: ['createdAt', 'licenceEntityId', 'password', 'updatedAt', 'userData']
        })
      })
    })
  })
})
