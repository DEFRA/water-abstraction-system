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
  let user

  describe('when called for an internal user', () => {
    beforeEach(() => {
      user = UsersFixture.adminInternal()
    })

    it('returns the correct user type and ID', async () => {
      const result = await FetchUserTypeService.go(user.userId)
      expect(result.$internal()).to.be.true()
      expect(result.id).to.equal(user.id)
    })
  })

  describe('when called for an external user', () => {
    beforeEach(() => {
      user = UsersFixture.external()
    })

    it('returns the correct user type and ID', async () => {
      const result = await FetchUserTypeService.go(user.userId)
      expect(result.$internal()).to.be.false()
      expect(result.id).to.equal(user.id)
    })
  })
})
