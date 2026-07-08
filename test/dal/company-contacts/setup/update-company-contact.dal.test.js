'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const CompanyContactModel = require('../../../../app/models/company-contact.model.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const LicenceRoleHelper = require('../../../support/helpers/licence-role.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')

// Thing under test
const UpdateCompanyContactDal = require('../../../../app/dal/company-contacts/setup/update-company-contact.dal.js')

describe('Company Contacts - Update Company Contact dal', () => {
  let today
  let clock
  let companyContact
  let contact
  let updatedCompanyContact
  let user
  let licenceRole
  let seedDate

  beforeAll(async () => {
    seedDate = new Date('2021-01-01')
    today = new Date('2025-06-02')

    clock = Sinon.useFakeTimers({ now: today, toFake: ['Date'] })

    licenceRole = LicenceRoleHelper.select('additionalContact')

    contact = await ContactHelper.add({
      createdAt: seedDate,
      updatedAt: seedDate
    })

    companyContact = await CompanyContactHelper.add({
      abstractionAlertLicences: null,
      abstractionAlerts: false,
      contactId: contact.id,
      createdAt: seedDate,
      licenceRoleId: licenceRole.id,
      updatedAt: seedDate
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

  afterAll(async () => {
    Sinon.restore()
    clock.restore()

    await contact.$query().delete()
    await companyContact.$query().delete()
  })

  describe('when a updating a company contact', () => {
    it('updates the company contact and associated contact', async () => {
      await UpdateCompanyContactDal(updatedCompanyContact)

      const updatedCompanyContactResult = await CompanyContactModel.query()
        .findById(companyContact.id)
        .withGraphFetched('contact')

      expect(updatedCompanyContactResult).toMatchObject({
        id: companyContact.id,
        abstractionAlerts: true,
        abstractionAlertLicences: null,
        companyId: companyContact.companyId,
        contactId: contact.id,
        createdAt: seedDate,
        createdBy: null,
        default: false,
        deletedAt: null,
        licenceRoleId: licenceRole.id,
        startDate: new Date('2022-04-01'),
        updatedAt: today,
        updatedBy: user.id
      })

      expect(updatedCompanyContactResult.contact).toEqual({
        contactType: 'department',
        createdAt: seedDate,
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
