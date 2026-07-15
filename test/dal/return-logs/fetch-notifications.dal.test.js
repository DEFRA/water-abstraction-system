// Test helpers
import EventHelper from '../../support/helpers/event.helper.js'
import * as NoticesFixture from '../../support/fixtures/notices.fixture.js'
import NotificationHelper from '../../support/helpers/notification.helper.js'
import * as NotificationsFixture from '../../support/fixtures/notifications.fixture.js'

import LicenceHelper from '../../support/helpers/licence.helper.js'

// Thing under test
import FetchNotificationsDal from '../../../app/dal/return-logs/fetch-notifications.dal.js'

describe('Return Logs - Fetch Notifications DAL', () => {
  let notice
  let notification

  beforeEach(async () => {
    notice = await EventHelper.add({
      ...NoticesFixture.returnsInvitation(),
      licences: [LicenceHelper.generateLicenceRef()]
    })

    notification = await NotificationHelper.add(NotificationsFixture.returnsInvitationEmail(notice))
  })

  afterAll(async () => {
    notice.$query().delete()
    notification.$query().delete()
  })

  describe('when the return log has notifications', () => {
    it('returns the matching notifications and the total', async () => {
      const result = await FetchNotificationsDal(notification.returnLogIds[0])

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

  describe('when the return log has no notifications', () => {
    it('returns an empty array and zero', async () => {
      const result = await FetchNotificationsDal('513f8813-3782-4c1b-a095-a078adf757f4')

      expect(result).toEqual({ notifications: [], totalNumber: 0 })
    })
  })
})
