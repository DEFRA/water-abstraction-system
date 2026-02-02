'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')

const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const FetchReturnLogNotificationsService = require('../../../app/services/return-logs/fetch-return-log-notifications.service.js')

describe('Return Logs - Fetch Return Log Notifications service', () => {
  let notice
  let notification

  beforeEach(async () => {
    notice = await EventHelper.add({
      ...NoticesFixture.returnsInvitation(),
      licences: [generateLicenceRef()]
    })

    notification = await NotificationHelper.add(NotificationsFixture.returnsInvitationEmail(notice))
  })

  after(async () => {
    notice.$query().delete()
    notification.$query().delete()
  })

  describe('when the return log has notifications', () => {
    it('returns the matching notifications', async () => {
      const result = await FetchReturnLogNotificationsService.go(notification.returnLogIds[0])

      expect(result).to.equal([
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
      ])
    })
  })

  describe('when the return log has no notifications', () => {
    it('returns an empty array', async () => {
      const result = await FetchReturnLogNotificationsService.go('513f8813-3782-4c1b-a095-a078adf757f4')

      expect(result).to.equal([])
    })
  })
})
