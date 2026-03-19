'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')

// Thing under test
const FetchUserService = require('../../../../app/services/users/internal/fetch-user.service.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Users - Internal - Fetch User service', () => {
  let user

  describe('when called', () => {
    beforeEach(() => {
      user = UsersFixture.digitiseApprover()

      UsersFixture.transformToFetchUserInternalResult(user)
    })

    it('returns the requested user', async () => {
      const result = await FetchUserService.go(user.id)

      expect(result).to.equal({
        id: user.id,
        username: user.username,
        enabled: true,
        lastLogin: user.lastLogin,
        statusPassword: null,
        application: 'water_admin',
        licenceEntity: null,
        groups: [
          {
            group: user.groups[0].group,
            id: user.groups[0].id,
            roles: user.groups[0].roles
          }
        ],
        roles: [
          {
            id: user.roles[0].id,
            role: user.roles[0].role,
            description: user.roles[0].description
          }
        ]
      })
    })
  })
})
