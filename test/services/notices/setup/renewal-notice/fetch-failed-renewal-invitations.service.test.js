// Test helpers
import * as EventHelper from '../../../../support/helpers/event.helper.js'
import * as NoticesFixture from '../../../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'
import * as NotificationHelper from '../../../../support/helpers/notification.helper.js'
import { compareStrings, generateUUID } from '../../../../../app/lib/general.lib.js'
import { generateLicenceRef } from '../../../../support/helpers/licence.helper.js'

// Thing under test
import FetchFailedRenewalInvitationsService from '../../../../../app/services/notices/setup/renewal-notice/fetch-failed-renewal-invitations.service.js'

describe('Notices - Setup - Renewal Notice - Fetch Failed Renewal Invitations service', () => {
  let licenceRefs
  let notice
  let notifications

  afterEach(async () => {
    for (const notification of notifications) {
      await notification.$query().delete()
    }

    await notice.$query().delete()
  })

  describe('when there is a matching notice', () => {
    beforeEach(async () => {
      notice = await EventHelper.add(NoticesFixture.renewalInvitation())
    })

    describe('with failed notifications', () => {
      beforeEach(async () => {
        notifications = []

        const notification = await NotificationHelper.add({
          ...NotificationsFixture.renewalInvitationLetter(notice),
          status: 'error'
        })

        notifications.push(notification)
      })

      describe('that do NOT include emails to primary users', () => {
        it('returns an object with empty properties', async () => {
          const result = await FetchFailedRenewalInvitationsService(notice.id)

          expect(result).toEqual({ licenceRefs: [], notificationIds: [] })
        })
      })

      describe('that include emails to primary users', () => {
        describe('and that have not been previously processed', () => {
          beforeEach(async () => {
            licenceRefs = [generateLicenceRef(), generateLicenceRef(), generateLicenceRef()].sort(
              (referenceString, compareString) => {
                return compareStrings(referenceString, compareString)
              }
            )
          })

          beforeEach(async () => {
            let notification = await NotificationHelper.add({
              ...NotificationsFixture.renewalInvitationEmail(notice),
              licences: [licenceRefs[0], licenceRefs[1]],
              recipient: 'primary.one@failed.com',
              status: 'error'
            })

            notifications.push(notification)

            notification = await NotificationHelper.add({
              ...NotificationsFixture.renewalInvitationEmail(notice),
              licences: [licenceRefs[1], licenceRefs[2]],
              recipient: 'primary.two@failed.com',
              status: 'error'
            })

            notifications.push(notification)
          })

          it('returns the failed notification IDs plus the unique licence refs from them', async () => {
            const result = await FetchFailedRenewalInvitationsService(notice.id)

            const expectedNotificationIds = [notifications[1].id, notifications[2].id].sort(
              (referenceString, compareString) => {
                return compareStrings(referenceString, compareString)
              }
            )

            expect(result).toEqual({ licenceRefs, notificationIds: expectedNotificationIds })
          })
        })

        describe('and that HAVE been previously processed', () => {
          beforeEach(async () => {
            const alternateNoticeId = generateUUID()

            let notification = await NotificationHelper.add({
              ...NotificationsFixture.renewalInvitationEmail(notice),
              alternateNoticeId,
              recipient: 'primary.one@processed.com',
              status: 'error'
            })

            notifications.push(notification)

            notification = await NotificationHelper.add({
              ...NotificationsFixture.renewalInvitationEmail(notice),
              alternateNoticeId,
              recipient: 'primary.two@processed.com',
              status: 'error'
            })

            notifications.push(notification)
          })

          it('returns an object with empty properties', async () => {
            const result = await FetchFailedRenewalInvitationsService(notice.id)

            expect(result).toEqual({ licenceRefs: [], notificationIds: [] })
          })
        })
      })
    })

    describe('with no failed notifications', () => {
      beforeEach(async () => {
        notifications = []
      })

      it('returns an object with empty properties', async () => {
        const result = await FetchFailedRenewalInvitationsService(notice.id)

        expect(result).toEqual({ licenceRefs: [], notificationIds: [] })
      })
    })
  })

  describe('when there is NOT a matching notice', () => {
    beforeEach(async () => {
      notifications = []
    })

    it('returns an object with empty properties', async () => {
      const result = await FetchFailedRenewalInvitationsService(generateUUID())

      expect(result).toEqual({ licenceRefs: [], notificationIds: [] })
    })
  })
})
