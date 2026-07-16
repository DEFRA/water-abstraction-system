// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as NoticesFixture from '../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import EventHelper from '../../support/helpers/event.helper.js'
import NotificationHelper from '../../support/helpers/notification.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import FetchNotificationService from '../../../app/services/company-contacts/fetch-notification.service.js'

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
      const result = await FetchNotificationService(email)

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
        const result = await FetchNotificationService(email)

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
        const result = await FetchNotificationService(email)

        expect(result).toBeUndefined()
      })
    })
  })
})
