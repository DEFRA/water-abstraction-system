// Test framework dependencies

// Test helpers
import * as NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import * as UsersFixture from '../../support/fixtures/users.fixture.js'

// Things we need to stub
import FetchNotificationDal from '../../../app/dal/users/fetch-notification.dal.js'
import FetchUserDal from '../../../app/dal/users/fetch-user.dal.js'

// Thing under test
import ViewNotificationService from '../../../app/services/users/view-notification.service.js'

describe('Users - Internal - View Notifications Service', () => {
  let auth
  let notification
  let type
  let user

  beforeEach(async () => {
    type = 'internal'

    const { id, username } = UsersFixture.billingAndData()

    user = { id, username }

    notification = NotificationsFixture.userInternalPasswordResetEmail(user.username)

    vi.mock('../../../app/dal/users/fetch-user.dal.js')
    FetchUserDal.mockReturnValue(user)
    vi.mock('../../../app/dal/users/fetch-notification.dal.js')
    FetchNotificationDal.mockReturnValue(notification)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('by a non-super user', () => {
      beforeEach(() => {
        auth = { credentials: { groups: [{ id: '242f836e-74a1-4b87-8b18-f6450a332e14', group: 'billing' }] } }
      })

      it('returns "protected" page data for the view', async () => {
        const result = await ViewNotificationService(notification.id, user.id, type, auth)

        expect(result).toEqual({
          activeNavBar: 'users',
          backLink: {
            href: `/system/users/${type}/${user.id}/communications`,
            text: 'Go back to user'
          },
          contents: '## This content is protected.',
          errorDetails: null,
          messageType: 'email',
          pageTitle: 'Password reset',
          pageTitleCaption: user.username,
          sentDate: '18 April 2025',
          sentTo: notification.recipient,
          status: notification.status
        })
      })
    })

    describe('by a super user', () => {
      beforeEach(() => {
        auth = { credentials: { groups: [{ id: '0348d272-a282-4bd4-8439-e312036f306e', group: 'super' }] } }
      })

      it('returns "full" page data for the view', async () => {
        const result = await ViewNotificationService(notification.id, user.id, type, auth)

        expect(result).toEqual({
          activeNavBar: 'users',
          backLink: {
            href: `/system/users/${type}/${user.id}/communications`,
            text: 'Go back to user'
          },
          contents: notification.plaintext,
          errorDetails: null,
          messageType: 'email',
          pageTitle: 'Password reset',
          pageTitleCaption: user.username,
          sentDate: '18 April 2025',
          sentTo: notification.recipient,
          status: notification.status
        })
      })
    })
  })
})
