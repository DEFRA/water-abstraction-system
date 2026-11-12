// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import CompanyContactHelper from 'water-abstraction-engine/test/helpers/company-contact.helper.js'
import ContactHelper from 'water-abstraction-engine/test/helpers/contact.helper.js'

// Thing under test
import FetchCompanyContactsDal from '../../../../src/dal/company-contacts/setup/fetch-company-contacts.dal.js'

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
      const result = await FetchCompanyContactsDal(companyContact.companyId, undefined)

      expect(result).toEqual([
        {
          contact: {
            contactType: 'person',
            department: null,
            email: null,
            firstName: 'Amara',
            id: contact.id,
            initials: null,
            lastName: 'Gupta',
            middleInitials: null,
            salutation: null,
            suffix: null
          },
          deletedAt: null,
          id: companyContact.id
        }
      ])
    })

    describe('and there is a company contact to ignore', () => {
      beforeAll(async () => {
        companyContactToIgnore = await CompanyContactHelper.add({
          companyId: companyContact.companyId,
          contactId: contact.id
        })
      })

      it('returns the matching company contacts', async () => {
        const result = await FetchCompanyContactsDal(companyContact.companyId, companyContactToIgnore)

        expect(result).toEqual([
          {
            contact: {
              contactType: 'person',
              department: null,
              email: null,
              firstName: 'Amara',
              id: contact.id,
              initials: null,
              lastName: 'Gupta',
              middleInitials: null,
              salutation: null,
              suffix: null
            },
            deletedAt: null,
            id: companyContact.id
          }
        ])
      })
    })
  })
})
