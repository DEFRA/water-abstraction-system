'use strict'

// Test helpers
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')

// Thing under test
const FetchCompanyContactDal = require('../../../../app/dal/company-contacts/setup/fetch-company-contact.dal.js')

describe('Company Contacts - Setup - Fetch Company Contact Dal', () => {
  let company
  let companyContact
  let contact

  beforeAll(async () => {
    company = await CompanyHelper.add()

    contact = await ContactHelper.add()

    companyContact = await CompanyContactHelper.add({
      abstractionAlerts: false,
      contactId: contact.id,
      companyId: company.id
    })
  })

  afterAll(async () => {
    await companyContact.$query().delete()
    await contact.$query().delete()
  })

  describe('when there is a company contact', () => {
    it('returns the matching company contact', async () => {
      const result = await FetchCompanyContactDal.go(companyContact.id)

      expect(result).toEqual({
        abstractionAlertLicences: null,
        abstractionAlerts: false,
        company: {
          id: company.id,
          name: 'Example Trading Ltd'
        },
        contact: {
          id: contact.id,
          contactType: 'person',
          department: null,
          email: null,
          firstName: 'Amara',
          initials: null,
          lastName: 'Gupta',
          middleInitials: null,
          salutation: null,
          suffix: null
        },
        id: companyContact.id
      })
    })
  })
})
