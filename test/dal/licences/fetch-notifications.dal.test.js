'use strict'

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')

// Thing under test
const FetchNotificationsDal = require('../../../app/dal/licences/fetch-notifications.dal.js')

describe('Licences - Fetch Notifications DAL', () => {
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
      const result = await FetchNotificationsDal(licence.licenceRef)

      expect(result).toEqual({
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
      const result = await FetchNotificationsDal(licence.licenceRef)

      expect(result).toEqual({
        notifications: [],
        totalNumber: 0
      })
    })
  })
})
