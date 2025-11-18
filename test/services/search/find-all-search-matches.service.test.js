'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const FetchLicenceSearchResultsService = require('../../../app/services/search/fetch-licence-search-results.service.js')
const FetchMonitoringStationSearchResultsService = require('../../../app/services/search/fetch-monitoring-station-search-results.service.js')
const FetchReturnLogSearchResultsService = require('../../../app/services/search/fetch-return-log-search-results.service.js')
const FetchUserSearchResultsService = require('../../../app/services/search/fetch-user-search-results.service.js')

// Thing under test
const FindAllSearchMatchesService = require('../../../app/services/search/find-all-search-matches.service.js')

describe('Search - Find all search matches service', () => {
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

  beforeEach(() => {
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
      searchQuery = '1231231231'
    })

    it('returns all the matching data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 3,
          licences: licenceResults,
          monitoringStations: monitoringStationResults,
          returnLogs: returnLogResults,
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 4,
          licences: licenceResults,
          monitoringStations: monitoringStationResults,
          returnLogs: returnLogResults,
          users: userResults
        }
      })
    })
  })

  describe('when only licences are requested', () => {
    beforeEach(() => {
      page = 1
      resultType = 'licence'
      searchQuery = '123/1231231'
    })

    it('returns only licence data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          licences: licenceResults,
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
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
    })

    it('returns only monitoring station data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          licences: { results: [], total: 0 },
          monitoringStations: monitoringStationResults,
          returnLogs: { results: [], total: 0 },
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
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
    })

    it('returns only return log data', async () => {
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: returnLogResults,
          users: { results: [], total: 0 }
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
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
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

      expect(result).to.equal({
        exactSearchResults: {
          amountFound: 1,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: userResults
        },
        largestResultCount: 1,
        similarSearchResults: {
          amountFound: 1,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 },
          users: userResults
        }
      })
    })
  })

  describe('when the search is not a full licence reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'licence'
    })

    describe('because it is too short', () => {
      beforeEach(() => {
        searchQuery = '12345'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })

    describe('because it does not contain a slash "/"', () => {
      beforeEach(() => {
        searchQuery = '123456'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })

    describe('because it does not contain enough numbers', () => {
      beforeEach(() => {
        searchQuery = '123456789'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a partial licence reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'licence'
    })

    describe('because it contains more than two consecutive letters', () => {
      beforeEach(() => {
        searchQuery = '12345ABC'
      })

      it('returns no similar matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

        expect(result.similarSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a full return reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'returnLog'
    })

    describe('because it has a leading zero', () => {
      beforeEach(() => {
        searchQuery = '012345'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })
  })

  describe('when the search is not a partial return reference', () => {
    beforeEach(() => {
      page = 1
      resultType = 'returnLog'
    })

    describe('because it contains non-numeric characters', () => {
      beforeEach(() => {
        searchQuery = 'A'
      })

      it('returns no similar matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

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
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

        expect(result.exactSearchResults.amountFound).to.equal(0)
      })
    })

    describe('because it does not contain an @ sign', () => {
      beforeEach(() => {
        searchQuery = 'a.bb.com'
      })

      it('returns no exact matches', async () => {
        const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

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
      const result = await FindAllSearchMatchesService.go(searchQuery, resultType, page)

      expect(result.exactSearchResults.users).to.equal(userResults)
    })
  })
})
