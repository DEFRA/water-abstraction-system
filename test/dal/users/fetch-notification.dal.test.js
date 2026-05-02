'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const FetchNotificationDal = require('../../../app/dal/users/fetch-notification.dal.js')

describe('Users - Fetch Notification DAL', () => {
  let notification
  let user

  before(async () => {
    user = UsersFixture.billingAndData()
  })

  afterEach(async () => {
    if (notification) {
      await notification.$query().delete()
    }
  })

  describe('when a matching notification exists', () => {
    beforeEach(async () => {
      notification = await NotificationHelper.add(NotificationsFixture.userInternalPasswordResetEmail(user.username))
    })

    it('returns the matching notification', async () => {
      const result = await FetchNotificationDal.go(notification.id, user.id)

      expect(result).to.equal({
        createdAt: notification.createdAt,
        id: notification.id,
        messageRef: 'password_reset_email',
        messageType: 'email',
        notifyError: null,
        notifyStatus: 'delivered',
        personalisation: notification.personalisation,
        plaintext: notification.plaintext,
        recipient: 'billing.data@wrls.gov.uk',
        status: 'sent'
      })
    })
  })

  describe('when a matching notification does not exist', () => {
    it('returns undefined', async () => {
      const result = await FetchNotificationDal.go('317aaa08-723d-4cb3-8f3b-5ab6a37b573f', user.id)

      expect(result).to.be.undefined()
    })
  })
})
