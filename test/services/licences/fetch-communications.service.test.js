'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')

// Thing under test
const FetchCommunicationsService = require('../../../app/services/licences/fetch-communications.service.js')

describe('Licences - Fetch Communications service', () => {
  let licence
  let notice
  let notification

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    notice = await EventHelper.add({
      ...NoticesFixture.returnsInvitation(),
      licences: [licence.licenceRef]
    })

    notification = await NotificationHelper.add(NotificationsFixture.returnsInvitationEmail(notice))
  })

  afterEach(async () => {
    await licence.$query().delete()
    await notice.$query().delete()
    await notification.$query().delete()
  })

  describe('when the licence has notifications', () => {
    it('returns the matching notifications', async () => {
      const result = await FetchCommunicationsService.go(licence.licenceRef, 1)

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
    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns no notifications', async () => {
      const result = await FetchCommunicationsService.go(licence.licenceRef, 1)

      expect(result).to.equal({
        notifications: [],
        totalNumber: 0
      })
    })
  })
})
