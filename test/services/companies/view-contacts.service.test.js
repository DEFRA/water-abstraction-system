// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import CustomersFixtures from '../../support/fixtures/customers.fixture.js'

// Test helpers
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

// Things we need to stub
import * as FetchCompanyContactsDal from '../../../src/dal/companies/fetch-company-crm-data.dal.js'
import * as FetchCompanyDal from '../../../src/dal/companies/fetch-company.dal.js'

// Thing under test
import ViewContactsService from '../../../src/services/companies/view-contacts.service.js'

describe('Companies - View Contacts service', () => {
  let auth
  let company
  let contacts
  let page
  let yarStub

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    company = CustomersFixtures.company()

    contacts = [
      {
        id: generateUUID(),
        contactType: 'additional-contact',
        contactName: 'Rachael Tyrell'
      }
    ]

    vi.spyOn(FetchCompanyDal, 'default').mockReturnValue(company)

    vi.spyOn(FetchCompanyContactsDal, 'default').mockReturnValue({
      contacts,
      totalNumber: contacts.length
    })

    page = '1'

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([
      { titleText: 'Contact removed', text: 'Rachael Tyrell was removed from this company.' }
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewContactsService(company.id, auth, page, yarStub)

      expect(result).toEqual({
        activeSecondaryNav: 'contacts',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        contacts: [
          {
            link: `/system/company-contacts/${contacts[0].id}/contact-details`,
            type: 'Additional contact',
            name: 'Rachael Tyrell'
          }
        ],
        links: {
          createContact: `/system/company-contacts/setup/${company.id}`
        },
        notification: {
          text: 'Rachael Tyrell was removed from this company.',
          titleText: 'Contact removed'
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 contacts'
        },
        roles: []
      })
    })
  })
})
