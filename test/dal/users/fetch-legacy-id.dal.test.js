// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as UsersFixture from '../../support/fixtures/users.fixture.js'

// Thing under test
import FetchLegacyIdDal from '../../../app/dal/users/fetch-legacy-id.dal.js'

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
      const result = await FetchLegacyIdDal(user.id)

      expect(result).toEqual(user.userId)
    })
  })
})
