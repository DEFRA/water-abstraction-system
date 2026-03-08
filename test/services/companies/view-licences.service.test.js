'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const LicenceModel = require('../../../app/models/licence.model.js')

// Things we need to stub
const FetchCompanyService = require('../../../app/services/companies/fetch-company.service.js')
const FetchLicencesService = require('../../../app/services/companies/fetch-licences.service.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

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

    Sinon.stub(FetchCompanyService, 'go').returns(company)

    licences = licences = [
      LicenceModel.fromJson({
        expiredDate: null,
        id: generateUUID(),
        lapsedDate: null,
        licenceRef: generateLicenceRef(),
        revokedDate: null,
        startDate: new Date('2022-01-01'),
        currentLicenceHolderId: company.id,
        currentLicenceHolder: company.name
      })
    ]

    Sinon.stub(FetchLicencesService, 'go').returns({ licences, totalNumber: 1 })

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
          text: 'Go back to search'
        },
        licences: [
          {
            currentLicenceHolder: {
              id: null,
              name: company.name
            },
            id: licences[0].id,
            licenceRef: licences[0].licenceRef,
            startDate: '1 January 2022',
            status: null
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
