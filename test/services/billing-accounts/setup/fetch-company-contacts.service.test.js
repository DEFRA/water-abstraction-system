// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import CompanyContactHelper from '../../../support/helpers/company-contact.helper.js'
import CompanyHelper from '../../../support/helpers/company.helper.js'
import ContactHelper from '../../../support/helpers/contact.helper.js'

// Thing under test
import FetchCompanyContactsService from '../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js'

describe('Billing Accounts - Setup - Fetch Company Contacts service', () => {
  let company
  let companyContact
  let companyContactDuplicate
  let companyWithNoContact
  let contact

  beforeAll(async () => {
    contact = await ContactHelper.add()
    company = await CompanyHelper.add()
    companyWithNoContact = await CompanyHelper.add()

    companyContact = await CompanyContactHelper.add({
      companyId: company.id,
      contactId: contact.id
    })
    companyContactDuplicate = await CompanyContactHelper.add({
      companyId: company.id,
      contactId: contact.id
    })
  })

  afterAll(async () => {
    await company.$query().delete()
    await companyContact.$query().delete()
    await companyContactDuplicate.$query().delete()
    await companyWithNoContact.$query().delete()
    await contact.$query().delete()
  })

  describe('when a matching company exists and has an contact', () => {
    it('returns the company name and matching contact', async () => {
      const result = await FetchCompanyContactsService(company.id)

      expect(result).toEqual({
        company: {
          id: company.id,
          name: company.name
        },
        contacts: [
          {
            id: contact.id,
            salutation: null,
            firstName: 'Amara',
            middleInitials: null,
            lastName: 'Gupta',
            initials: null,
            contactType: 'person',
            suffix: null,
            department: null
          }
        ]
      })
    })
  })

  describe('when a matching company exists and has no contact', () => {
    it('returns the company name and an empty contacts array', async () => {
      const result = await FetchCompanyContactsService(companyWithNoContact.id)

      expect(result).toEqual({
        company: {
          id: companyWithNoContact.id,
          name: companyWithNoContact.name
        },
        contacts: []
      })
    })
  })
})
