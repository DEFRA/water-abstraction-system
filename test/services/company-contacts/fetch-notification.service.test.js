'use strict'

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchNotificationService = require('../../../app/services/company-contacts/fetch-notification.service.js')

describe('Company Contacts - Fetch Notification service', () => {
  let email
  let notice
  let notification

  beforeAll(async () => {
    notice = await EventHelper.add(NoticesFixture.returnsInvitation())
  })

  beforeEach(async () => {
    email = `${generateUUID()}@test.com`
  })

  afterAll(async () => {
    await notice.$query().delete()
  })

  afterEach(async () => {
    await notification.$query().delete()
  })

  describe('when there are notifications for the recipient', () => {
    beforeEach(async () => {
      notification = await NotificationHelper.add({
        ...NotificationsFixture.returnsInvitationEmail(notice),
        recipient: email
      })
    })

    it('returns a notification', async () => {
      const result = await FetchNotificationService.go(email)

      expect(result).toEqual({
        id: notification.id
      })
    })
  })

  describe('when there are no notifications for the recipient', () => {
    describe('because the email does not match', () => {
      beforeEach(async () => {
        notification = await NotificationHelper.add({
          ...NotificationsFixture.returnsInvitationEmail(notice),
          recipient: `${generateUUID()}@test.com`
        })
      })

      it('returns undefined', async () => {
        const result = await FetchNotificationService.go(email)

        expect(result).toBeUndefined()
      })
    })

    describe('because the "messageRef" type is excluded', () => {
      beforeEach(async () => {
        notification = await NotificationHelper.add({
          ...NotificationsFixture.returnsInvitationEmail(notice),
          recipient: email,
          messageRef: 'password_reset_email'
        })
      })

      it('returns undefined', async () => {
        const result = await FetchNotificationService.go(email)

        expect(result).toBeUndefined()
      })
    })
  })
})
