// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import UsersFixture from '../../../support/fixtures/users.fixture.js'

// Thing under test
import FetchUserDetailsDal from '../../../../src/dal/users/internal/fetch-user-details.dal.js'

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Users - Internal - Fetch User Details DAL', () => {
  let user

  describe('when called', () => {
    beforeEach(() => {
      user = UsersFixture.digitiseApprover()

      UsersFixture.transformToFetchUserInternalResult(user)
    })

    it('returns the requested user', async () => {
      const result = await FetchUserDetailsDal(user.id)

      expect(result).toEqual({
        application: 'water_admin',
        enabled: true,
        groups: [
          {
            group: user.groups[0].group,
            id: user.groups[0].id,
            roles: user.groups[0].roles
          }
        ],
        id: user.id,
        lastLogin: user.lastLogin,
        licenceEntity: null,
        roles: [
          {
            description: user.roles[0].description,
            id: user.roles[0].id,
            role: user.roles[0].role
          }
        ],
        statusPassword: null,
        userId: user.userId,
        username: user.username
      })
    })
  })
})
