// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'

// Thing under test
import FetchUserDetailsDal from '../../../../app/dal/users/internal/fetch-user-details.dal.js'

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
        id: user.id,
        userId: user.userId,
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
