'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const FindAllSearchMatchesService = require('../../../app/services/search/find-all-search-matches.service.js')

// Thing under test
const ViewSearchService = require('../../../app/services/search/view-search.service.js')

describe('Search - View Search service', () => {
  let page
  let searchQuery
  let searchResultType

  const auth = { credentials: { scope: ['billing'] } }

  const yar = {
    get: (key) => {
      if (key === 'searchQuery') {
        return searchQuery
      }

      if (key === 'searchResultType') {
        return searchResultType
      }

      return null
    }
  }

  beforeEach(() => {
    page = 1

    Sinon.stub(FindAllSearchMatchesService, 'go').resolves({
      results: [
        {
          exact: false,
          model: {
            accountNumber: 'A12345678A',
            company: { name: 'Company 1' },
            createdAt: new Date('2000-01-01T00:00:00.000Z'),
            id: 'billing-account-1'
          },
          type: 'billingAccount'
        },
        {
          exact: false,
          model: {
            accountNumber: 'B12345678A',
            company: { name: 'Company 2' },
            createdAt: new Date('2001-01-01T00:00:00.000Z'),
            id: 'billing-account-2'
          },
          type: 'billingAccount'
        }
      ],
      total: 2
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      searchResultType = 'all'
      searchQuery = '12345678'
    })

    it('returns page data for the view', async () => {
      const result = await ViewSearchService.go(auth, yar, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
          },
          {
            checked: false,
            text: 'Licence holders',
            value: 'licenceHolder'
          },
          {
            checked: false,
            text: 'Licences',
            value: 'licence'
          },
          {
            checked: false,
            text: 'Monitoring stations',
            value: 'monitoringStation'
          },
          {
            checked: false,
            text: 'Return logs',
            value: 'returnLog'
          },
          {
            checked: false,
            text: 'Users',
            value: 'user'
          }
        ],
        noResults: false,
        page: 1,
        pageTitle: 'Search results for "12345678"',
        pageTitleCaption: null,
        pagination: {
          numberOfPages: 1,
          showingMessage: 'Showing all 2 matches'
        },
        query: '12345678',
        results: [
          {
            col2Title: 'Holder',
            col2Value: 'Company 1',
            col3Title: 'Created date',
            col3Value: '1 January 2000',
            exact: false,
            link: '/system/billing-accounts/billing-account-1',
            reference: 'A12345678A',
            statusTag: null,
            type: 'Billing account'
          },
          {
            col2Title: 'Holder',
            col2Value: 'Company 2',
            col3Title: 'Created date',
            col3Value: '1 January 2001',
            exact: false,
            link: '/system/billing-accounts/billing-account-2',
            reference: 'B12345678A',
            statusTag: null,
            type: 'Billing account'
          }
        ],
        resultType: null,
        showResults: true
      })
    })
  })

  describe('when called with no page specified', () => {
    beforeEach(() => {
      page = undefined
    })

    it('returns page data for the blank search page', async () => {
      const result = await ViewSearchService.go(auth, yar, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
          },
          {
            checked: false,
            text: 'Licence holders',
            value: 'licenceHolder'
          },
          {
            checked: false,
            text: 'Licences',
            value: 'licence'
          },
          {
            checked: false,
            text: 'Monitoring stations',
            value: 'monitoringStation'
          },
          {
            checked: false,
            text: 'Return logs',
            value: 'returnLog'
          },
          {
            checked: false,
            text: 'Users',
            value: 'user'
          }
        ],
        pageTitle: 'Search',
        query: undefined,
        resultType: undefined,
        showResults: false
      })
    })
  })

  describe('when called with no search query set because the session has expired', () => {
    beforeEach(() => {
      searchQuery = undefined
    })

    it('returns page data for the blank search page', async () => {
      const result = await ViewSearchService.go(auth, yar, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
          },
          {
            checked: false,
            text: 'Licence holders',
            value: 'licenceHolder'
          },
          {
            checked: false,
            text: 'Licences',
            value: 'licence'
          },
          {
            checked: false,
            text: 'Monitoring stations',
            value: 'monitoringStation'
          },
          {
            checked: false,
            text: 'Return logs',
            value: 'returnLog'
          },
          {
            checked: false,
            text: 'Users',
            value: 'user'
          }
        ],
        pageTitle: 'Search',
        query: undefined,
        resultType: undefined,
        showResults: false
      })
    })
  })

  describe('when called with no result type specified', () => {
    beforeEach(() => {
      searchResultType = null
      searchQuery = '12345678'
    })

    it('still returns page data for the view', async () => {
      const result = await ViewSearchService.go(auth, yar, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
          },
          {
            checked: false,
            text: 'Licence holders',
            value: 'licenceHolder'
          },
          {
            checked: false,
            text: 'Licences',
            value: 'licence'
          },
          {
            checked: false,
            text: 'Monitoring stations',
            value: 'monitoringStation'
          },
          {
            checked: false,
            text: 'Return logs',
            value: 'returnLog'
          },
          {
            checked: false,
            text: 'Users',
            value: 'user'
          }
        ],
        noResults: false,
        page: 1,
        pageTitle: 'Search results for "12345678"',
        pageTitleCaption: null,
        pagination: {
          numberOfPages: 1,
          showingMessage: 'Showing all 2 matches'
        },
        query: '12345678',
        results: [
          {
            col2Title: 'Holder',
            col2Value: 'Company 1',
            col3Title: 'Created date',
            col3Value: '1 January 2000',
            exact: false,
            link: '/system/billing-accounts/billing-account-1',
            reference: 'A12345678A',
            statusTag: null,
            type: 'Billing account'
          },
          {
            col2Title: 'Holder',
            col2Value: 'Company 2',
            col3Title: 'Created date',
            col3Value: '1 January 2001',
            exact: false,
            link: '/system/billing-accounts/billing-account-2',
            reference: 'B12345678A',
            statusTag: null,
            type: 'Billing account'
          }
        ],
        resultType: null,
        showResults: true
      })
    })
  })
})
