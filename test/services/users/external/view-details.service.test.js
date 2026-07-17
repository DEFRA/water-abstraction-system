// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import UsersFixture from '../../../support/fixtures/users.fixture.js'

// Things we want to stub
import * as FetchUserDetailsDal from '../../../../app/dal/users/external/fetch-user-details.dal.js'

// Thing under test
import ViewDetailsService from '../../../../app/services/users/external/view-details.service.js'

describe('Users - External - View Details service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'] }
  }
  const user = UsersFixture.external()

  let back

  beforeEach(() => {
    vi.spyOn(FetchUserDetailsDal, 'default').mockResolvedValue(user)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the external user view', async () => {
      const result = await ViewDetailsService(user.id, auth, back)

      expect(result).toEqual({
        activeNavBar: 'users',
        activeSecondaryNav: 'details',
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        backQueryString: '?back=users',
        lastSignedIn: '6 October 2022 at 10:00:00',
        pageTitle: 'User details',
        pageTitleCaption: user.username,
        permissions: 'None',
        roles: [],
        status: 'enabled'
      })
    })
  })
})
