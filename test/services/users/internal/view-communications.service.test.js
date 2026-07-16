// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'

// Things we need to stub
import * as FetchNotificationsDal from '../../../../app/dal/users/internal/fetch-notifications.dal.js'
import * as FetchUserDal from '../../../../app/dal/users/fetch-user.dal.js'

// Thing under test
import ViewCommunicationsService from '../../../../app/services/users/internal/view-communications.service.js'

describe('Users - Internal - View Communications Service', () => {
  const page = '1'

  let user

  beforeEach(async () => {
    const { id, username } = UsersFixture.billingAndData()

    user = { id, username }

    vi.spyOn(FetchUserDal, 'default').mockReturnValue(user)

    vi.spyOn(FetchNotificationsDal, 'default').mockReturnValue({
      notifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService(user.id, page)

      expect(result).toEqual({
        activeNavBar: 'users',
        activeSecondaryNav: 'communications',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 communications'
        },
        backLink: {
          href: `/system/users`,
          text: 'Go back to users'
        },
        notifications: [],
        pageTitle: 'Communications',
        pageTitleCaption: user.username
      })
    })
  })
})
