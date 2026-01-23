'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const FetchInternalUserService = require('../../../app/services/users/fetch-internal-user.service.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Users - Fetch Internal User service', () => {
  let userId

  describe('when called', () => {
    beforeEach(() => {
      userId = UsersFixture.adminInternal().id
    })

    it('returns the requested user', async () => {
      const result = await FetchInternalUserService.go(userId)
      expect(result.username).to.equal(UsersFixture.adminInternal().username)
    })
  })
})
