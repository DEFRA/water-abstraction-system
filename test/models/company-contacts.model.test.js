'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../support/helpers/company.helper.js')
const CompanyModel = require('../../app/models/company.model.js')
const ContactsHelper = require('../support/helpers/contact.helper.js')
const ContactsModel = require('../../app/models/contact.model.js')
const DatabaseSupport = require('../support/database.js')

// Thing under test
const CompanyContactModel = require('../../app/models/company-contact.model.js')

describe('Company Contacts model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await CompanyContactHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await CompanyContactModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(CompanyContactModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to companies', () => {
      let testCompany
      beforeEach(async () => {
        testRecord = await CompanyContactHelper.add()

        testCompany = await CompanyHelper.add({
          id: testRecord.companyId
        })
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query()
          .innerJoinRelated('companies')

        expect(query).to.exist()
      })

      it('can eager load the companies', async () => {
        const result = await CompanyContactModel.query()
          .findById(testRecord.id)
          .withGraphFetched('companies')

        expect(result).to.be.instanceOf(CompanyContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companies).to.be.an.array()
        expect(result.companies[0]).to.be.an.instanceOf(CompanyModel)
        expect(result.companies).to.include(testCompany)
      })
    })
    describe('when linking to contacts', () => {
      let testContact
      beforeEach(async () => {
        testRecord = await CompanyContactHelper.add()

        testContact = await ContactsHelper.add({
          id: testRecord.contactId
        })
      })

      it('can successfully run a related query', async () => {
        const query = await CompanyContactModel.query()
          .innerJoinRelated('contacts')

        expect(query).to.exist()
      })

      it('can eager load the company contacts', async () => {
        const result = await CompanyContactModel.query()
          .findById(testRecord.id)
          .withGraphFetched('contacts')

        expect(result).to.be.instanceOf(CompanyContactModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.contacts).to.be.an.array()
        expect(result.contacts[0]).to.be.an.instanceOf(ContactsModel)
        expect(result.contacts).to.include(testContact)
      })
    })
  })
})
