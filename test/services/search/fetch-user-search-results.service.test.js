'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UserHelper = require('../../support/helpers/user.helper.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchUserSearchResultsService = require('../../../app/services/search/fetch-user-search-results.service.js')

describe('Search - Fetch user search results service', () => {
  const users = []

  before(async () => {
    // Add the users in non-alphabetical order to prove the ordering in the results
    users.push(await UserHelper.add({ username: 'TESTSEARCH02@wrls.gov.uk', application: 'water_vml' }))
    users.push(await UserHelper.add({ username: 'TESTSEARCH03@wrls.gov.uk' }))
    users.push(await UserHelper.add({ username: 'TESTSEARCH01@wrls.gov.uk' }))
  })

  describe('when matching users exist', () => {
    it('returns the correctly ordered matching users', async () => {
      const result = await FetchUserSearchResultsService.go('TESTSEARCH', 1)

      expect(result).to.equal({
        results: [
          {
            application: users[2].application,
            id: users[2].id,
            lastLogin: users[2].lastLogin,
            username: users[2].username
          },
          {
            application: users[0].application,
            id: users[0].id,
            lastLogin: users[0].lastLogin,
            username: users[0].username
          },
          {
            application: users[1].application,
            id: users[1].id,
            lastLogin: users[1].lastLogin,
            username: users[1].username
          }
        ],
        total: 3
      })
    })
  })

  describe('when only one matching user exists', () => {
    it('returns the correct user', async () => {
      const result = await FetchUserSearchResultsService.go('TESTSEARCH02', 1)

      expect(result).to.equal({
        results: [
          {
            application: users[0].application,
            id: users[0].id,
            lastLogin: users[0].lastLogin,
            username: users[0].username
          }
        ],
        total: 1
      })
    })
  })

  describe('when the case of the search text does not match that of the username', () => {
    it('still returns the correct users', async () => {
      const result = await FetchUserSearchResultsService.go('tEsTsEaRcH', 1)

      expect(result).to.equal({
        results: [
          {
            application: users[2].application,
            id: users[2].id,
            lastLogin: users[2].lastLogin,
            username: users[2].username
          },
          {
            application: users[0].application,
            id: users[0].id,
            lastLogin: users[0].lastLogin,
            username: users[0].username
          },
          {
            application: users[1].application,
            id: users[1].id,
            lastLogin: users[1].lastLogin,
            username: users[1].username
          }
        ],
        total: 3
      })
    })
  })

  describe('when multiple pages of results exist', () => {
    beforeEach(() => {
      // Set the page size to 1 to force multiple pages of results
      Sinon.stub(databaseConfig, 'defaultPageSize').value(1)
    })

    afterEach(() => {
      Sinon.restore()
    })

    it('correctly returns the requested page of results', async () => {
      const result = await FetchUserSearchResultsService.go('TESTSEARCH', 2)

      expect(result).to.equal({
        results: [
          {
            application: users[0].application,
            id: users[0].id,
            lastLogin: users[0].lastLogin,
            username: users[0].username
          }
        ],
        total: 3
      })
    })
  })

  describe('when no matching users exist', () => {
    it('returns empty query results', async () => {
      const result = await FetchUserSearchResultsService.go('TESTSEARCH99', 1)

      expect(result).to.equal({
        results: [],
        total: 0
      })
    })
  })

  describe('when searching for an exact match', () => {
    it('returns the correct user', async () => {
      const result = await FetchUserSearchResultsService.go('TESTSEARCH03@wrls.gov.uk', 1, true)

      expect(result).to.equal({
        results: [
          {
            application: users[1].application,
            id: users[1].id,
            lastLogin: users[1].lastLogin,
            username: users[1].username
          }
        ],
        total: 1
      })
    })
  })
})
