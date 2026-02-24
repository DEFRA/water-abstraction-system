'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const FetchLegacyUserIdService = require('../../../app/services/users/fetch-legacy-user-id.service.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Users - Fetch Legacy User ID service', () => {
  describe('when called', () => {
    let user

    beforeEach(() => {
      user = UsersFixture.adminInternal()
    })

    it('returns the correct user ID', async () => {
      const result = await FetchLegacyUserIdService.go(user.id)

      expect(result.userId).to.equal(user.userId)
    })
  })
})
