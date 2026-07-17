// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import UsersFixture from '../../../support/fixtures/users.fixture.js'

// Things we want to stub
import * as FetchUserDetailsDal from '../../../../app/dal/users/internal/fetch-user-details.dal.js'
import FeatureFlagsConfig from '../../../../config/feature-flags.config.js'

// Thing under test
import ViewDetailsService from '../../../../app/services/users/internal/view-details.service.js'

describe('Users - Internal - View Details service', () => {
  const auth = { credentials: { user: { id: '367e5f4b-07d1-460b-842f-adf8f5dad7ef' } } }
  const user = UsersFixture.basicAccess()

  beforeEach(() => {
    vi.replaceProperty(FeatureFlagsConfig, 'enableUsersView', true)
    vi.spyOn(FetchUserDetailsDal, 'default').mockResolvedValue(user)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the internal user view', async () => {
      const result = await ViewDetailsService(auth, user.id)

      expect(result).toEqual({
        activeNavBar: 'users',
        activeSecondaryNav: 'details',
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        id: user.id,
        lastSignedIn: '6 October 2022 at 10:00:00',
        pageTitle: 'User details',
        pageTitleCaption: user.username,
        permissions: 'Basic access',
        roles: [],
        showEditButton: true,
        status: 'enabled'
      })
    })
  })
})
