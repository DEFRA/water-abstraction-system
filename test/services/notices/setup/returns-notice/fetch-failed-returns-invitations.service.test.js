'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../../support/helpers/event.helper.js')
const NoticesFixture = require('../../../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../fixtures/notifications.fixture.js')
const NotificationHelper = require('../../../../support/helpers/notification.helper.js')
const { futureDueDate } = require('../../../../../app/presenters/notices/base.presenter.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Thing under test
const FetchFailedReturnsInvitationsService = require('../../../../../app/services/notices/setup/returns-notice/fetch-failed-returns-invitations.service.js')

describe('Notices - Setup - Returns Notice - Fetch Failed Returns Invitations service', () => {
  let licenceRefs
  let returnLogIds
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
      notice = await EventHelper.add(NoticesFixture.returnsInvitation())
    })

    describe('with failed notifications', () => {
      beforeEach(async () => {
        notifications = []

        const notification = await NotificationHelper.add({
          ...NotificationsFixture.returnsInvitationLetter(notice),
          status: 'error'
        })

        notifications.push(notification)
      })

      describe('that do NOT include emails to primary users', () => {
        it('returns an object with empty properties', async () => {
          const result = await FetchFailedReturnsInvitationsService.go(notice.id)

          expect(result).to.equal({ dueDate: null, licenceRefs: [], notificationIds: [], returnLogIds: [] })
        })
      })

      describe('that include emails to primary users', () => {
        describe('and that have not been previously processed', () => {
          beforeEach(async () => {
            // The notifications will share some of the same licence references and return log IDs. We can then test
            // what the service returns doesn't contain duplicates
            licenceRefs = [generateLicenceRef(), generateLicenceRef(), generateLicenceRef()].sort()
            returnLogIds = [generateUUID(), generateUUID(), generateUUID()]
          })

          describe('and where their "due date" was calculated as today plus 28 days', () => {
            beforeEach(async () => {
              let notification = await NotificationHelper.add({
                ...NotificationsFixture.returnsInvitationEmail(notice),
                dueDate: futureDueDate('email'),
                licences: [licenceRefs[0], licenceRefs[1]],
                recipient: 'primary.one@failed.com',
                returnLogIds: [returnLogIds[0], returnLogIds[1]],
                status: 'error'
              })

              notifications.push(notification)

              notification = await NotificationHelper.add({
                ...NotificationsFixture.returnsInvitationEmail(notice),
                dueDate: futureDueDate('email'),
                licences: [licenceRefs[1], licenceRefs[2]],
                recipient: 'primary.two@failed.com',
                returnLogIds: [returnLogIds[1], returnLogIds[2]],
                status: 'error'
              })

              notifications.push(notification)
            })

            it('returns the failed notification IDs plus the unique licence refs and return logs IDs from them, and a calculated due date', async () => {
              const result = await FetchFailedReturnsInvitationsService.go(notice.id)

              expect(result).to.equal({
                dueDate: futureDueDate('letter'),
                licenceRefs,
                notificationIds: [notifications[1].id, notifications[2].id],
                returnLogIds
              })
            })
          })

          describe('and where their "due date" was set based on the latest due date', () => {
            beforeEach(async () => {
              let notification = await NotificationHelper.add({
                ...NotificationsFixture.returnsInvitationEmail(notice),
                dueDate: new Date('2025-04-28'),
                licences: [licenceRefs[0], licenceRefs[1]],
                recipient: 'primary.one@failed.com',
                returnLogIds: [returnLogIds[0], returnLogIds[1]],
                status: 'error'
              })

              notifications.push(notification)

              notification = await NotificationHelper.add({
                ...NotificationsFixture.returnsInvitationEmail(notice),
                dueDate: new Date('2025-04-28'),
                licences: [licenceRefs[1], licenceRefs[2]],
                recipient: 'primary.two@failed.com',
                returnLogIds: [returnLogIds[1], returnLogIds[2]],
                status: 'error'
              })

              notifications.push(notification)
            })

            it('returns the failed notification IDs plus the unique licence refs and return logs IDs from them, and a calculated due date', async () => {
              const result = await FetchFailedReturnsInvitationsService.go(notice.id)

              expect(result).to.equal({
                dueDate: new Date('2025-04-28'),
                licenceRefs,
                notificationIds: [notifications[1].id, notifications[2].id],
                returnLogIds
              })
            })
          })
        })

        describe('and that HAVE been previously processed', () => {
          beforeEach(async () => {
            const alternateNoticeId = generateUUID()

            let notification = await NotificationHelper.add({
              ...NotificationsFixture.returnsInvitationEmail(notice),
              alternateNoticeId,
              recipient: 'primary.one@processed.com',
              status: 'error'
            })

            notifications.push(notification)

            notification = await NotificationHelper.add({
              ...NotificationsFixture.returnsInvitationEmail(notice),
              alternateNoticeId,
              recipient: 'primary.two@processed.com',
              status: 'error'
            })

            notifications.push(notification)
          })

          it('returns an object with empty properties', async () => {
            const result = await FetchFailedReturnsInvitationsService.go(notice.id)

            expect(result).to.equal({ dueDate: null, licenceRefs: [], notificationIds: [], returnLogIds: [] })
          })
        })
      })
    })

    describe('with no failed notifications', () => {
      it('returns an object with empty properties', async () => {
        const result = await FetchFailedReturnsInvitationsService.go('1f0e0086-7bc4-4ef2-a696-35ea1e79d224')

        expect(result).to.equal({ dueDate: null, licenceRefs: [], notificationIds: [], returnLogIds: [] })
      })
    })
  })

  describe('when there is NOT a matching notice', () => {
    it('returns an object with empty properties', async () => {
      const result = await FetchFailedReturnsInvitationsService.go('1f0e0086-7bc4-4ef2-a696-35ea1e79d224')

      expect(result).to.equal({ dueDate: null, licenceRefs: [], notificationIds: [], returnLogIds: [] })
    })
  })
})
