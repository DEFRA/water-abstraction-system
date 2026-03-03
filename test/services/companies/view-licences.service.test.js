'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Things we need to stub
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')
const FetchLicencesService = require('../../../app/services/companies/fetch-licences.service.js')

// Thing under test
const ViewLicencesService = require('../../../app/services/companies/view-licences.service.js')

describe('Companies - View Licences service', () => {
  let auth
  let company
  let licences
  let page

  beforeEach(async () => {
    auth = { credentials: { roles: [] } }

    company = CustomersFixtures.company()

    licences = CustomersFixtures.licences()

    Sinon.stub(FetchCompanyService, 'go').returns(company)
    Sinon.stub(FetchLicencesService, 'go').returns({
      licences,
      totalNumber: 1
    })

    page = '1'
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicencesService.go(company.id, auth, page)

      expect(result).to.equal({
        activeSecondaryNav: 'licences',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        licenceVersions: [
          {
            count: 1,
            endDate: null,
            licenceId: licences[0].id,
            licenceRef: licences[0].licenceRef,
            link: {
              hiddenText: 'current licence version',
              href: `/system/licence-versions/${licences[0].licenceVersions[0].id}`
            },
            startDate: '1 January 2022',
            status: 'current'
          }
        ],
        pageTitle: 'Licences',
        pageTitleCaption: 'Tyrell Corporation',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 1,
          showingMessage: 'Showing all 1 licences'
        },
        roles: []
      })
    })
  })
})
