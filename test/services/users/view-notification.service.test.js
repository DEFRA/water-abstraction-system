'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Things we need to stub
const FetchNotificationService = require('../../../app/services/users/fetch-notification.service.js')
const FetchUserService = require('../../../app/services/users/fetch-user.service.js')

// Thing under test
const ViewNotificationService = require('../../../app/services/users/view-notification.service.js')

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

    Sinon.stub(FetchUserService, 'go').returns(user)
    Sinon.stub(FetchNotificationService, 'go').returns(notification)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('by a non-super user', () => {
      beforeEach(() => {
        auth = { credentials: { groups: [{ id: '242f836e-74a1-4b87-8b18-f6450a332e14', group: 'billing' }] } }
      })

      it('returns "protected" page data for the view', async () => {
        const result = await ViewNotificationService.go(notification.id, user.id, type, auth)

        expect(result).to.equal({
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
        const result = await ViewNotificationService.go(notification.id, user.id, type, auth)

        expect(result).to.equal({
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
