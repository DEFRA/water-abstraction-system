// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'

// Things we want to stub
import * as FetchNotificationsDal from '../../../../app/dal/users/external/fetch-notifications.dal.js'
import * as FetchUserDal from '../../../../app/dal/users/fetch-user.dal.js'

// Thing under test
import ViewCommunicationsService from '../../../../app/services/users/external/view-communications.service.js'

describe('Users - External - View Communications service', () => {
  const auth = {
    credentials: { scope: ['manage_accounts'] }
  }
  const page = '1'

  let back
  let user

  beforeEach(() => {
    const { id, username } = UsersFixture.external()

    user = { id, licenceEntityId: 'b2c55396-9bbb-448d-85e7-2be1dbefc02b', username }

    vi.spyOn(FetchUserDal, 'default').mockResolvedValue(user)
    vi.spyOn(FetchNotificationsDal, 'default').mockResolvedValue({
      notifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService(user.id, auth, page, back)

      expect(result).toEqual({
        activeNavBar: 'users',
        activeSecondaryNav: 'communications',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 communications'
        },
        backLink: {
          href: '/system/users',
          text: 'Go back to users'
        },
        backQueryString: '?back=users',
        notifications: [],
        pageTitle: 'Communications',
        pageTitleCaption: user.username
      })
    })
  })
})
