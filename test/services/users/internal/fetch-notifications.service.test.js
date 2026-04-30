'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const NotificationsFixture = require('../../../support/fixtures/notifications.fixture.js')
const UserFixture = require('../../../support/fixtures/users.fixture.js')

// Thing under test
const FetchNotificationsService = require('../../../../app/services/users/internal/fetch-notifications.service.js')

describe('Users - Internal - Fetch Notifications service', () => {
  let notification
  let user

  beforeEach(async () => {
    user = UserFixture.billingAndData()

    notification = await NotificationHelper.add(NotificationsFixture.userInternalPasswordResetEmail(user.username))
  })

  after(async () => {
    notification.$query().delete()
  })

  describe('when the user has notifications', () => {
    it('returns the matching notifications and the total', async () => {
      const result = await FetchNotificationsService.go(user.username)

      expect(result).to.equal({
        notifications: [
          {
            createdAt: notification.createdAt,
            id: notification.id,
            messageRef: 'password_reset_email',
            messageType: notification.messageType,
            status: notification.status
          }
        ],
        totalNumber: 1
      })
    })
  })

  describe('when the user has no notifications', () => {
    it('returns an empty array and zero', async () => {
      const result = await FetchNotificationsService.go('mystery.user@wrls.gov.uk')

      expect(result).to.equal({ notifications: [], totalNumber: 0 })
    })
  })
})
