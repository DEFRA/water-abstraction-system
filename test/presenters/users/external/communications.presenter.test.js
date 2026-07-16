// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import NotificationsFixture from '../../../support/fixtures/notifications.fixture.js'
import UsersFixture from '../../../support/fixtures/users.fixture.js'

// Thing under test
import CommunicationsPresenter from '../../../../app/presenters/users/external/communications.presenter.js'

describe('Users - External - Communications presenter', () => {
  let back
  let notifications
  let user
  let viewingUserScope

  beforeEach(() => {
    back = 'users'
    user = UsersFixture.billingAndData()

    notifications = [NotificationsFixture.userExternalShareExistingEmail(user.username)]
    viewingUserScope = ['manage_accounts']
  })

  it('correctly presents the data', () => {
    const result = CommunicationsPresenter(user, notifications, viewingUserScope, back)

    expect(result).toEqual({
      activeNavBar: 'users',
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      backQueryString: '?back=users',
      notifications: [
        {
          link: {
            hiddenText: 'sent 18 April 2025 via email',
            href: `/system/users/external/${user.id}/notifications/${notifications[0].id}`,
            text: 'Share existing user'
          },
          method: 'Email',
          sentDate: '18 April 2025',
          status: 'sent'
        }
      ],
      pageTitle: 'Communications',
      pageTitleCaption: user.username
    })
  })
})
