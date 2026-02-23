'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NoticesFixture = require('../../../support/fixtures/notices.fixture.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const NotificationsFixture = require('../../../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const FetchNotificationService = require('../../../../app/services/company-contacts/setup/fetch-notification.service.js')

describe('Company Contacts - Setup - Fetch Notification service', () => {
  let email
  let notice
  let notification

  before(async () => {
    notice = await EventHelper.add(NoticesFixture.returnsInvitation())
  })

  beforeEach(async () => {
    email = `${generateUUID()}@test.com`
  })

  after(async () => {
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

      expect(result).to.equal({
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

        expect(result).to.be.undefined()
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

        expect(result).to.be.undefined()
      })
    })
  })
})
