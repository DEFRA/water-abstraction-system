'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const FetchUserTypeService = require('../../../app/services/users/fetch-user-type.service.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Users - Fetch User Type service', () => {
  let userId

  describe('when called for an internal user', () => {
    beforeEach(() => {
      userId = UsersFixture.adminInternal().userId
    })

    it('returns the correct user type', async () => {
      const result = await FetchUserTypeService.go(userId)
      expect(result.$internal()).to.be.true()
    })
  })

  describe('when called for an external user', () => {
    beforeEach(() => {
      userId = UsersFixture.external().userId
    })

    it('returns the correct user type', async () => {
      const result = await FetchUserTypeService.go(userId)
      expect(result.$internal()).to.be.false()
    })
  })
})
