'use strict'

// Test helpers
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')

// Thing under test
const FetchCompanyContactsDal = require('../../../../app/dal/company-contacts/setup/fetch-company-contacts.dal.js')

describe('Company Contacts - Setup - Fetch Company Contacts dal', () => {
  let additionalCompanyContact
  let companyContact
  let companyContactToIgnore
  let contact

  beforeAll(async () => {
    contact = await ContactHelper.add()
    contact = await ContactHelper.add()

    companyContact = await CompanyContactHelper.add({
      contactId: contact.id
    })

    // Add additional contact - not related to the same company
    additionalCompanyContact = await CompanyContactHelper.add({ contactId: contact.id })
  })

  afterAll(async () => {
    await additionalCompanyContact.$query().delete()
    await companyContact.$query().delete()
    await contact.$query().delete()
    await companyContactToIgnore.$query().delete()
  })

  describe('when there are company contacts', () => {
    it('returns the matching company contacts', async () => {
      const result = await FetchCompanyContactsDal.go(companyContact.companyId, undefined)

      expect(result).toEqual([
        {
          id: companyContact.id,
          contact: {
            id: contact.id,
            salutation: null,
            firstName: 'Amara',
            middleInitials: null,
            lastName: 'Gupta',
            initials: null,
            contactType: 'person',
            suffix: null,
            department: null,
            email: null
          },
          deletedAt: null
        }
      ])
    })

    describe('and there is a company contact to ignore', () => {
      beforeAll(async () => {
        companyContactToIgnore = await CompanyContactHelper.add({
          contactId: contact.id,
          companyId: companyContact.companyId
        })
      })

      it('returns the matching company contacts', async () => {
        const result = await FetchCompanyContactsDal.go(companyContact.companyId, companyContactToIgnore)

        expect(result).toEqual([
          {
            id: companyContact.id,
            contact: {
              id: contact.id,
              salutation: null,
              firstName: 'Amara',
              middleInitials: null,
              lastName: 'Gupta',
              initials: null,
              contactType: 'person',
              suffix: null,
              department: null,
              email: null
            },
            deletedAt: null
          }
        ])
      })
    })
  })
})
