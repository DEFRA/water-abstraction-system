'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchNotificationsService = require('../../../app/services/company-contacts/fetch-notifications.service.js')

describe('Company contact - Fetch Communications service', () => {
  let notice
  let noticeTwo
  let notification
  let notificationTwo
  let email
  let excludedNotification

  beforeEach(async () => {
    // We want to ensure the email is unique so we do not pick up email seeded from other tests
    email = `${generateUUID()}@acme.co.uk`

    notice = await EventHelper.add(NoticesFixture.returnsInvitation())

    noticeTwo = await EventHelper.add(NoticesFixture.alertStop())

    notification = await NotificationHelper.add({
      ...NotificationsFixture.returnsInvitationEmail(notice),
      recipient: email
    })

    notificationTwo = await NotificationHelper.add({
      ...NotificationsFixture.abstractionAlertEmail(noticeTwo),
      recipient: email
    })

    // This should not be returned as it is an excluded message type
    excludedNotification = await NotificationHelper.add({
      ...NotificationsFixture.abstractionAlertEmail(notice),
      recipient: email,
      messageRef: 'password_reset_email'
    })
  })

  afterEach(async () => {
    await excludedNotification.$query().delete()
    await notice.$query().delete()
    await noticeTwo.$query().delete()
    await notification.$query().delete()
    await notificationTwo.$query().delete()
  })

  describe('when the company contact has notifications', () => {
    it('returns the matching notifications', async () => {
      const result = await FetchNotificationsService.go(email, 1)

      expect(result).to.equal({
        notifications: [
          {
            createdAt: notificationTwo.createdAt,
            id: notificationTwo.id,
            messageType: notificationTwo.messageType,
            status: notificationTwo.status,
            event: {
              id: noticeTwo.id,
              issuer: noticeTwo.issuer,
              subtype: noticeTwo.subtype,
              sendingAlertType: 'stop'
            }
          },
          {
            createdAt: notification.createdAt,
            id: notification.id,
            messageType: notification.messageType,
            status: notification.status,
            event: {
              id: notice.id,
              issuer: notice.issuer,
              subtype: notice.subtype,
              sendingAlertType: null
            }
          }
        ],
        totalNumber: 2
      })
    })
  })

  describe('when the company contact has no notifications', () => {
    beforeEach(() => {
      email = `${generateUUID()}@acme.co.uk`
    })

    it('returns no notifications', async () => {
      const result = await FetchNotificationsService.go(email, 1)

      expect(result).to.equal({
        notifications: [],
        totalNumber: 0
      })
    })
  })
})
