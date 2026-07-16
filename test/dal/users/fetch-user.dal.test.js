// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import UsersFixture from '../../support/fixtures/users.fixture.js'

// Thing under test
import FetchUserDal from '../../../app/dal/users/fetch-user.dal.js'

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So,
// unlike other fetch tests we don't create any test records and assert they are in our results as we already have
// sufficient data to work with.
describe('Users - Internal - Fetch User DAL', () => {
  let user

  describe('when called', () => {
    beforeEach(() => {
      user = UsersFixture.digitiseApprover()

      UsersFixture.transformToFetchUserInternalResult(user)
    })

    it('returns the requested user', async () => {
      const result = await FetchUserDal(user.id)

      expect(result).toEqual({ id: user.id, licenceEntityId: null, username: user.username })
    })
  })
})
