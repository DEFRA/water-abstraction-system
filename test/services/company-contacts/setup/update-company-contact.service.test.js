'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const CompanyContactModel = require('../../../../app/models/company-contact.model.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')

// Thing under test
const UpdateCompanyContactService = require('../../../../app/services/company-contacts/setup/update-company-contact.service.js')

describe.only('Company Contacts - Update Company Contact service', () => {
  let today
  let clock
  let companyContact
  let contact
  let updatedCompanyContact
  let user

  before(async () => {
    today = new Date('2025-06-02')

    clock = Sinon.useFakeTimers(today)

    contact = await ContactHelper.add({
      createdAt: new Date('2021-01-01'),
      updatedAt: new Date('2021-01-01')
    })

    companyContact = await CompanyContactHelper.add({
      contactId: contact.id,
      abstractionAlerts: false,
      createdAt: new Date('2021-01-01'),
      updatedAt: new Date('2021-01-01')
    })

    user = UserHelper.select()

    updatedCompanyContact = {
      id: companyContact.id,
      abstractionAlerts: true,
      contactId: contact.id,
      email: 'rachael.tyrell@tyrellcorp.com',
      name: 'Rachael Tyrell',
      updatedBy: user.id
    }
  })

  after(async () => {
    Sinon.restore()
    clock.restore()

    await contact.$query().delete()
    await companyContact.$query().delete()
  })

  describe('when a updating a company contact', () => {
    it('updates the company contact and associated contact', async () => {
      await UpdateCompanyContactService.go(updatedCompanyContact)

      const updatedCompanyContactResult = await CompanyContactModel.query()
        .findById(companyContact.id)
        .withGraphFetched('contact')

      expect(updatedCompanyContactResult).to.equal(
        {
          abstractionAlerts: true,
          companyId: companyContact.companyId,
          contactId: contact.id,
          createdBy: null,
          default: false,
          id: companyContact.id,
          updatedBy: user.id,
          updateAt: today
        },
        { skip: ['startDate', 'createdAt', 'contact', 'licenceRoleId'] }
      )

      expect(updatedCompanyContactResult.contact).to.equal({
        contactType: 'department',
        createdAt: new Date('2021-01-01'),
        dataSource: 'wrls',
        department: 'Rachael Tyrell',
        email: 'rachael.tyrell@tyrellcorp.com',
        externalId: null,
        firstName: null,
        id: contact.id,
        initials: null,
        lastName: null,
        middleInitials: null,
        salutation: null,
        suffix: null,
        updatedAt: today
      })
    })
  })
})
