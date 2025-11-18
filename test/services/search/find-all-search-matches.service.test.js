'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const FetchBillingAccountSearchResultsService = require('../../../app/services/search/fetch-billing-account-search-results.service.js')
const FetchLicenceSearchResultsService = require('../../../app/services/search/fetch-licence-search-results.service.js')
const FetchMonitoringStationSearchResultsService = require('../../../app/services/search/fetch-monitoring-station-search-results.service.js')
const FetchReturnLogSearchResultsService = require('../../../app/services/search/fetch-return-log-search-results.service.js')
const FetchUserSearchResultsService = require('../../../app/services/search/fetch-user-search-results.service.js')

// Thing under test
const FindAllSearchMatchesService = require('../../../app/services/search/find-all-search-matches.service.js')

describe('Search - Find all search matches service', () => {
  const billingAccountResults = {
    results: [
      {
        accountNumber: 'A12345678A',
        createdAt: new Date('2000-01-01T00:00:00.000Z'),
        id: 'billing-account-1',
        name: 'Company 1'
      }
    ],
    total: 1
  }

  const licenceResults = {
    results: [
      {
        $ends: () => {
          return null
        },
        id: 'licence-1',
        licenceRef: '01/123',
        metadata: { contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr' }] }
      }
    ],
    total: 1
  }

  const monitoringStationResults = {
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
  }

  const returnLogResults = {
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
  }

  const userResults = {
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

  let page
  let resultType
  let searchQuery
  let userScopes

  beforeEach(() => {
    Sinon.stub(FetchBillingAccountSearchResultsService, 'go').resolves(billingAccountResults)
    Sinon.stub(FetchLicenceSearchResultsService, 'go').resolves(licenceResults)
    Sinon.stub(FetchMonitoringStationSearchResultsService, 'go').resolves(monitoringStationResults)
    Sinon.stub(FetchReturnLogSearchResultsService, 'go').resolves(returnLogResults)
    Sinon.stub(FetchUserSearchResultsService, 'go').resolves(userResults)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      page = 1
      resultType = null
      searchQuery = '12312312312'
      userScopes = ['billing']
    })

    it('returns all the matching data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 3,
          billingAccounts: { results: [], total: 0 },
          licences: licenceResults,
          monitoringStations: monitoringStationResults,
          returnLogs: returnLogResults,
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 4,
          billingAccounts: { results: [], total: 0 },
          licences: licenceResults,
          monitoringStations: monitoringStationResults,
          returnLogs: returnLogResults,
          users: userResults
        }
      })
    })
  })

  describe('when only billing accounts are requested', () => {
    beforeEach(() => {
      page = 1
      resultType = 'billingAccount'
      searchQuery = 'A12345678A'
      userScopes = ['billing']
    })

    it('returns only billing account data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)
      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          billingAccounts: billingAccountResults,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
          billingAccounts: billingAccountResults,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: { results: [], total: 0 }
        }
      })
    })
  })

  describe('when only licences are requested', () => {
    beforeEach(() => {
      page = 1
      resultType = 'licence'
      searchQuery = '123/1231231'
      userScopes = []
    })

    it('returns only licence data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)
      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          billingAccounts: { results: [], total: 0 },
          licences: licenceResults,
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
          billingAccounts: { results: [], total: 0 },
          licences: licenceResults,
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: { results: [], total: 0 }
        }
      })
    })
  })

  describe('when only monitoring stations are requested', () => {
    beforeEach(() => {
      page = 1
      resultType = 'monitoringStation'
      searchQuery = '1231231231'
      userScopes = []
    })

    it('returns only monitoring station data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)
      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          billingAccounts: { results: [], total: 0 },
          licences: { results: [], total: 0 },
          monitoringStations: monitoringStationResults,
          returnLogs: { results: [], total: 0 },
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
          billingAccounts: { results: [], total: 0 },
          licences: { results: [], total: 0 },
          monitoringStations: monitoringStationResults,
          returnLogs: { results: [], total: 0 },
          users: { results: [], total: 0 }
        }
      })
    })
  })

  describe('when only return logs are requested', () => {
    beforeEach(() => {
      page = 1
      resultType = 'returnLog'
      searchQuery = '1231231231'
      userScopes = []
    })

    it('returns only return log data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          billingAccounts: { results: [], total: 0 },
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: returnLogResults,
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
          billingAccounts: { results: [], total: 0 },
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: returnLogResults,
          users: { results: [], total: 0 }
        }
      })
    })
  })

  describe('when only users are requested', () => {
    beforeEach(() => {
      page = 1
      resultType = 'user'
      searchQuery = 'a@bb.com'
    })

    it('returns only user data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          billingAccounts: { results: [], total: 0 },
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: userResults
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
          billingAccounts: { results: [], total: 0 },
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: userResults
        }
      })
    })
  })

  describe('when the user does not have scope for billing account searches', () => {
    beforeEach(() => {
      page = 1
      resultType = 'billingAccount'
      userScopes = ['not-billing']
    })

    describe('and the search term matches an exact billing account reference', () => {
      beforeEach(() => {
        searchQuery = 'A12345678A'
      })

      it('returns no billing account matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })

    describe('and the search term matches a partial billing account reference', () => {
      beforeEach(() => {
        searchQuery = 'A123'
      })

      it('returns no billing account matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.similarSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the user has scope for billing account searches', () => {
    beforeEach(() => {
      page = 1
      userScopes = ['billing']
    })

    describe('but billing accounts are not requested', () => {
      beforeEach(() => {
        resultType = 'not-billingAccount'
      })

      describe('and the search term matches an exact billing account reference', () => {
        beforeEach(() => {
          searchQuery = 'A12345678A'
        })

        it('returns no billing account matches', async () => {
          const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

          expect(result.exactSearchResults.amountFound).to.equal(0)
        })
      })

      describe('and the search term matches a partial billing account reference', () => {
        beforeEach(() => {
          searchQuery = 'A123'
        })

        it('returns no billing account matches', async () => {
          const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

          expect(result.similarSearchResults.amountFound).to.equal(0)
        })
      })
    })
  })

  describe('when the search is not a full billing account reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'billingAccount'
      userScopes = ['billing']
    })

    describe('because it does not match the pattern', () => {
      beforeEach(() => {
        searchQuery = 'A1234567A'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a partial billing account reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'billingAccount'
      userScopes = ['billing']
    })

    describe('because it contains letters that are not allowed in the reference', () => {
      beforeEach(() => {
        searchQuery = 'X123'
      })

      it('returns no similar matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.similarSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a full licence reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'licence'
      userScopes = []
    })

    describe('because it is too short', () => {
      beforeEach(() => {
        searchQuery = '12345'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })

    describe('because it does not contain a slash "/"', () => {
      beforeEach(() => {
        searchQuery = '123456'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })

    describe('because it does not contain enough numbers', () => {
      beforeEach(() => {
        searchQuery = '123456789'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a partial licence reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'licence'
      userScopes = []
    })

    describe('because it contains more than two consecutive letters', () => {
      beforeEach(() => {
        searchQuery = '12345ABC'
      })

      it('returns no similar matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.similarSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a full return reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'returnLog'
      userScopes = []
    })

    describe('because it has a leading zero', () => {
      beforeEach(() => {
        searchQuery = '012345'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a partial return reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'returnLog'
      userScopes = []
    })

    describe('because it contains non-numeric characters', () => {
      beforeEach(() => {
        searchQuery = 'A'
      })

      it('returns no similar matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.similarSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a full username', () => {
    beforeEach(() => {
      page = 1
      resultType = 'user'
    })

    describe('because it does not contain enough characters', () => {
      beforeEach(() => {
        searchQuery = 'a@b.c'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })

    describe('because it does not contain an @ sign', () => {
      beforeEach(() => {
        searchQuery = 'a.bb.com'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is a full username', () => {
    beforeEach(() => {
      page = 1
      resultType = 'user'
      searchQuery = 'a@bb.com'
    })

    it('returns exact matches', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page, userScopes)

      expect(result.exactSearchResults.users).to.equal(userResults)
    })
  })
})
