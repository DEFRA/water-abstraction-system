'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')
const FetchNotificationsService = require('../../../app/services/company-contacts/fetch-notifications.service.js')

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
    Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
    Sinon.stub(FetchNotificationsService, 'go').returns({
      notifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService.go(companyContact.id, page)

      expect(result).to.equal({
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
