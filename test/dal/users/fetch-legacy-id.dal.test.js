'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const FetchLegacyIdDal = require('../../../app/dal/users/fetch-legacy-id.dal.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Users - Fetch Legacy ID DAL', () => {
  let user

  describe('when called', () => {
    beforeEach(() => {
      user = UsersFixture.adminInternal()
    })

    it('returns the correct legacy "userId"', async () => {
      const result = await FetchLegacyIdDal.go(user.id)

      expect(result).to.equal(user.userId)
    })
  })
})
