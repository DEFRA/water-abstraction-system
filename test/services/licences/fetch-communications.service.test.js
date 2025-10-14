'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')

// Thing under test
const FetchCommunicationsService = require('../../../app/services/licences/fetch-communications.service.js')

describe('Licences - Fetch Communications service', () => {
  let licenceRef
  let notice
  let notification

  beforeEach(async () => {
    notice = await EventHelper.add(NoticesFixture.returnsInvitation())
    notification = await NotificationHelper.add(NotificationsFixture.returnsInvitationEmail(notice))

    licenceRef = notice.licences[0]
  })

  describe('when the licence has notifications', () => {
    it('returns the matching notifications', async () => {
      const result = await FetchCommunicationsService.go(licenceRef, 1)

      expect(result).to.equal({
        notifications: [
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
        totalNumber: 1
      })
    })
  })

  describe('when the licence has no notifications', () => {
    it('returns no notifications', async () => {
      const result = await FetchCommunicationsService.go('01/FOO', 1)

      expect(result).to.equal({
        notifications: [],
        totalNumber: 0
      })
    })
  })
})
