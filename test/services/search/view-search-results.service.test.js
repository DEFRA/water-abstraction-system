'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const LicenceModel = require('../../../app/models/licence.model.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

// Thing under test
const ViewSearchResultsService = require('../../../app/services/search/view-search-results.service.js')

describe('Search - View search results service', () => {
  let licenceResults
  let page
  let returnLogResults
  let searchQuery

  async function returnLicenceResults() {
    return licenceResults
  }

  async function returnReturnLogResults() {
    return returnLogResults
  }

  beforeEach(() => {
    Sinon.stub(LicenceModel, 'query').returns({
      joinRelated: Sinon.stub().returnsThis(),
      orderBy: Sinon.stub().returnsThis(),
      page: Sinon.stub().callsFake(returnLicenceResults),
      select: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis()
    })

    Sinon.stub(ReturnLogModel, 'query').returns({
      join: Sinon.stub().returnsThis(),
      orderBy: Sinon.stub().returnsThis(),
      page: Sinon.stub().callsFake(returnReturnLogResults),
      select: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis()
    })

    page = 1
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      searchQuery = '123'

      licenceResults = {
        results: [
          {
            $ends: () => {
              return null
            },
            id: 'licence-1',
            licenceRef: '01/123',
            metadata: {
              Initials: 'F',
              Name: 'Surname',
              Salutation: 'Mr'
            }
          },
          {
            $ends: () => {
              return null
            },
            id: 'licence-2',
            licenceRef: '123/45/678',
            metadata: {
              Initials: 'F',
              Name: 'Surname',
              Salutation: 'Mr'
            }
          }
        ],
        total: 2
      }

      returnLogResults = {
        results: [
          {
            id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
            licenceRef: '01/123',
            returnReference: '123',
            region: 'Region',
            regionId: 1,
            status: 'completed'
          }
        ],
        total: 1
      }
    })

    it('returns page data for the view', async () => {
      const result = await ViewSearchResultsService.go(searchQuery, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        licences: [
          {
            id: 'licence-1',
            licenceEndDate: null,
            licenceEndedText: null,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '01/123'
          },
          {
            id: 'licence-2',
            licenceEndDate: null,
            licenceEndedText: null,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '123/45/678'
          }
        ],
        noResults: false,
        page: 1,
        pageTitle: 'Search results',
        pagination: {
          numberOfPages: 1
        },
        query: '123',
        returnLogs: [
          {
            id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
            licenceRef: '01/123',
            returnReference: '123',
            region: 'Region',
            statusText: 'complete'
          }
        ],
        showResults: true
      })
    })
  })

  describe('when called with a query that returns no results', () => {
    beforeEach(() => {
      searchQuery = 'searchthis'

      licenceResults = { results: [], total: 0 }
      returnLogResults = { results: [], total: 0 }
    })

    it('returns page data showing that there are no results', async () => {
      const result = await ViewSearchResultsService.go(searchQuery, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        licences: null,
        noResults: true,
        page: 1,
        pageTitle: 'Search results',
        pagination: {
          numberOfPages: 0
        },
        query: 'searchthis',
        returnLogs: null,
        showResults: true
      })
    })
  })
})
