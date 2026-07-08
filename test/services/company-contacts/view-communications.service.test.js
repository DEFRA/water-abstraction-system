'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCompanyContactDal = require('../../../app/dal/company-contacts/fetch-company-contact.dal.js')
const FetchCompanyService = require('../../../app/dal/companies/fetch-company.dal.js')
const FetchNotificationsDal = require('../../../app/dal/company-contacts/fetch-notifications.dal.js')

// Thing under test
const ViewCommunicationsService = require('../../../app/services/company-contacts/view-communications.service.js')

describe('Company Contacts - View Communications Service', () => {
  const page = '1'

  let company
  let companyContact

  beforeEach(async () => {
    company = CustomersFixtures.company()

    companyContact = {
      companyId: company.id,
      contact: CustomersFixtures.contact(),
      id: generateUUID()
    }

    Sinon.stub(FetchCompanyService, 'go').returns(company)
    Sinon.stub(FetchCompanyContactDal, 'go').returns(companyContact)
    Sinon.stub(FetchNotificationsDal, 'go').returns({
      notifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService(companyContact.id, page)

      expect(result).toEqual({
        activeSecondaryNav: 'communications',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 communications'
        },
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to licence holder contacts'
        },
        notifications: [],
        pageTitle: 'Communications for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
