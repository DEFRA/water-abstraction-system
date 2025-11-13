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
const ViewSearchResultsService = require('../../../app/services/search/view-search-results.service.js')

describe('Search - View search results service', () => {
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
      exactSearchResults: {
        amountFound: 6,
        billingAccounts: {
          results: [
            {
              accountNumber: 'A12345678A',
              createdAt: new Date('2000-01-01T00:00:00.000Z'),
              id: 'billing-account-1',
              name: 'Company 1'
            }
          ],
          total: 1
        },
        licences: {
          results: [
            {
              $ends: () => {
                return null
              },
              id: 'licence-1',
              licenceRef: '01/123',
              metadata: { contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr' }] }
            },
            {
              $ends: () => {
                return null
              },
              id: 'licence-2',
              licenceRef: '123/45/678',
              metadata: { contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr' }] }
            }
          ],
          total: 2
        },
        monitoringStations: {
          results: [
            {
              catchmentName: 'Catchment 1',
              id: 'monitoring-station-1',
              gridReference: 'SX1234512345',
              label: 'Monitoring Station 1',
              riverName: 'River 1'
            }
          ],
          total: 1
        },
        returnLogs: {
          results: [
            {
              dueDates: [new Date('2001-01-01')],
              endDates: [new Date('2000-12-31')],
              id: 'licence-1',
              ids: ['v1:1:1/2/3:1:2000-01-01:2000-12-31'],
              licenceRef: '01/123',
              returnReference: '123',
              returnRequirementId: 'return-requirement-1',
              statuses: ['completed']
            }
          ],
          total: 1
        },
        users: {
          results: [
            {
              application: 'water_admin',
              id: 'user-1',
              lastLogin: new Date('2001-01-01T00:00:00Z'),
              username: 'TESTSEARCH01@wrls.gov.uk'
            }
          ],
          total: 1
        }
      },
      largestResultCount: 2,
      similarSearchResults: {
        amountFound: 6,
        billingAccounts: {
          results: [
            {
              accountNumber: 'A12345678A',
              createdAt: new Date('2000-01-01T00:00:00.000Z'),
              id: 'billing-account-1',
              name: 'Company 1'
            }
          ],
          total: 1
        },
        licences: {
          results: [
            {
              $ends: () => {
                return null
              },
              id: 'licence-1',
              licenceRef: '01/123',
              metadata: { contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr' }] }
            },
            {
              $ends: () => {
                return null
              },
              id: 'licence-2',
              licenceRef: '123/45/678',
              metadata: { contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr' }] }
            }
          ],
          total: 2
        },
        monitoringStations: {
          results: [
            {
              catchmentName: 'Catchment 1',
              id: 'monitoring-station-1',
              gridReference: 'SX1234512345',
              label: 'Monitoring Station 1',
              riverName: 'River 1'
            }
          ],
          total: 1
        },
        returnLogs: {
          results: [
            {
              dueDates: [new Date('2001-01-01')],
              endDates: [new Date('2000-12-31')],
              id: 'licence-1',
              ids: ['v1:1:1/2/3:1:2000-01-01:2000-12-31'],
              licenceRef: '01/123',
              returnReference: '123',
              returnRequirementId: 'return-requirement-1',
              statuses: ['completed']
            }
          ],
          total: 1
        },
        users: {
          results: [
            {
              application: 'water_admin',
              id: 'user-1',
              lastLogin: new Date('2001-01-01T00:00:00Z'),
              username: 'TESTSEARCH01@wrls.gov.uk'
            }
          ],
          total: 1
        }
      }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      searchResultType = 'all'
      searchQuery = '1231231231'
    })

    it('returns page data for the view', async () => {
      const result = await ViewSearchResultsService.go(auth, yar, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        exactMatches: {
          billingAccounts: [
            {
              accountNumber: 'A12345678A',
              createdAt: '1 January 2000',
              id: 'billing-account-1',
              name: 'Company 1'
            }
          ],
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
          monitoringStations: [
            {
              catchmentName: 'Catchment 1',
              gridReference: 'SX1234512345',
              id: 'monitoring-station-1',
              label: 'Monitoring Station 1',
              riverName: 'River 1'
            }
          ],
          returnLogs: [
            {
              endDate: '31 December 2000',
              id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
              licenceId: 'licence-1',
              licenceRef: '01/123',
              returnReference: '123',
              statusText: 'complete'
            }
          ],
          users: [
            {
              id: 'user-1',
              lastLogin: '1 January 2001',
              type: 'Internal',
              username: 'TESTSEARCH01@wrls.gov.uk'
            }
          ]
        },
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
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
          }
        ],
        noPartialResults: false,
        noResults: false,
        page: 1,
        pageTitle: 'Search results for "1231231231"',
        pageTitleCaption: null,
        pagination: {
          numberOfPages: 1
        },
        partialMatches: {
          billingAccounts: [
            {
              accountNumber: 'A12345678A',
              createdAt: '1 January 2000',
              id: 'billing-account-1',
              name: 'Company 1'
            }
          ],
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
          monitoringStations: [
            {
              catchmentName: 'Catchment 1',
              gridReference: 'SX1234512345',
              id: 'monitoring-station-1',
              label: 'Monitoring Station 1',
              riverName: 'River 1'
            }
          ],
          returnLogs: [
            {
              endDate: '31 December 2000',
              id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
              licenceId: 'licence-1',
              licenceRef: '01/123',
              returnReference: '123',
              statusText: 'complete'
            }
          ],
          users: [
            {
              id: 'user-1',
              lastLogin: '1 January 2001',
              type: 'Internal',
              username: 'TESTSEARCH01@wrls.gov.uk'
            }
          ]
        },
        query: '1231231231',
        resultType: null,
        resultTypeText: 'all matches',
        showExactResults: true,
        showResults: true
      })
    })
  })

  describe('when called with no result type specified', () => {
    beforeEach(() => {
      searchResultType = null
      searchQuery = '1231231231'
    })

    it('still returns page data for the view', async () => {
      const result = await ViewSearchResultsService.go(auth, yar, page)

      expect(result).to.equal({
        activeNavBar: 'search',
        exactMatches: {
          billingAccounts: [
            {
              accountNumber: 'A12345678A',
              createdAt: '1 January 2000',
              id: 'billing-account-1',
              name: 'Company 1'
            }
          ],
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
          monitoringStations: [
            {
              catchmentName: 'Catchment 1',
              gridReference: 'SX1234512345',
              id: 'monitoring-station-1',
              label: 'Monitoring Station 1',
              riverName: 'River 1'
            }
          ],
          returnLogs: [
            {
              endDate: '31 December 2000',
              id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
              licenceId: 'licence-1',
              licenceRef: '01/123',
              returnReference: '123',
              statusText: 'complete'
            }
          ],
          users: [
            {
              id: 'user-1',
              lastLogin: '1 January 2001',
              type: 'Internal',
              username: 'TESTSEARCH01@wrls.gov.uk'
            }
          ]
        },
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
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
          }
        ],
        noPartialResults: false,
        noResults: false,
        page: 1,
        pageTitle: 'Search results for "1231231231"',
        pageTitleCaption: null,
        pagination: {
          numberOfPages: 1
        },
        partialMatches: {
          billingAccounts: [
            {
              accountNumber: 'A12345678A',
              createdAt: '1 January 2000',
              id: 'billing-account-1',
              name: 'Company 1'
            }
          ],
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
          monitoringStations: [
            {
              catchmentName: 'Catchment 1',
              gridReference: 'SX1234512345',
              id: 'monitoring-station-1',
              label: 'Monitoring Station 1',
              riverName: 'River 1'
            }
          ],
          returnLogs: [
            {
              endDate: '31 December 2000',
              id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
              licenceId: 'licence-1',
              licenceRef: '01/123',
              returnReference: '123',
              statusText: 'complete'
            }
          ],
          users: [
            {
              id: 'user-1',
              lastLogin: '1 January 2001',
              type: 'Internal',
              username: 'TESTSEARCH01@wrls.gov.uk'
            }
          ]
        },
        query: '1231231231',
        resultType: null,
        resultTypeText: 'all matches',
        showExactResults: true,
        showResults: true
      })
    })
  })
})
