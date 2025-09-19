'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')

// Things we need to stub
const FetchNotificationsService = require('../../../../app/services/jobs/notification-status/fetch-notifications.service.js')
const NotifyConfig = require('../../../../config/notify.config.js')
const ViewMessageDataRequest = require('../../../../app/requests/notify/view-message-data.request.js')

// Thing under test
const ProcessNotificationStatusService = require('../../../../app/services/jobs/notification-status/process-notification-status.service.js')

describe('Job - Notifications - Process Notification Status service', () => {
  const ONE_HUNDRED_MILLISECONDS = 100

  let event
  let notification
  let notifierStub
  let response

  beforeEach(async () => {
    // By setting the delay to 100ms we can keep the tests fast whilst assuring our batch mechanism is delaying
    // correctly. We do not want increase the timeout for the test as we want them to fail if a timeout occurs
    Sinon.stub(NotifyConfig, 'delay').value(ONE_HUNDRED_MILLISECONDS)

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the request to Notify for the message details is successful', () => {
    describe('and the returned message "status" is not an error', () => {
      beforeEach(async () => {
        // NOTE: The service only uses the `status` field from the Notify result. If you want to see a full representation
        // look at test/requests/notify/notify-status.request.test.js
        response = {
          statusCode: 200,
          body: {
            status: 'delivered'
          }
        }

        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response
        })
      })

      describe('and the notification was not an abstraction alert', () => {
        beforeEach(async () => {
          event = await EventHelper.add({
            metadata: {},
            licences: '["11/111"]',
            referenceCode: 'RINV-LX4P57',
            status: 'completed',
            subtype: 'returnInvitation',
            type: 'notification'
          })

          notification = await NotificationHelper.add({
            eventId: event.id,
            licences: '["11/111"]',
            messageRef: 'returns_invitation_primary_user_email',
            messageType: 'email',
            notifyId: '62f1299a-bf0c-4d89-8240-232cdb24c0f8',
            notifyStatus: 'created',
            plaintext: 'Dear Clean Water Limited,\r\n',
            recipient: 'hello@example.com',
            status: 'pending'
          })
        })

        it('updates the matching notification record and logs the time taken', { timeout: 3000 }, async () => {
          await ProcessNotificationStatusService.go()

          const refreshedNotification = await notification.$query()

          expect(refreshedNotification).to.equal(
            {
              eventId: event.id,
              id: notification.id,
              licenceMonitoringStationId: null,
              licences: ['11/111'],
              notifyError: null,
              messageRef: 'returns_invitation_primary_user_email',
              messageType: 'email',
              notifyId: '62f1299a-bf0c-4d89-8240-232cdb24c0f8',
              notifyStatus: 'delivered',
              personalisation: null,
              plaintext: 'Dear Clean Water Limited,\r\n',
              recipient: 'hello@example.com',
              returnLogIds: null,
              status: 'sent'
            },
            { skip: ['createdAt'] }
          )

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Notification status job complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.count).to.exist()
        })
      })

      describe('and the notification was for an abstraction alert', () => {
        beforeEach(async () => {
          event = await EventHelper.add({
            metadata: {},
            licences: '["11/111"]',
            referenceCode: 'WAA-8GD4ZQ',
            status: 'completed',
            subtype: 'waterAbstractionAlerts',
            type: 'notification'
          })

          notification = await NotificationHelper.add({
            eventId: event.id,
            licenceMonitoringStationId: '76a03738-0c65-4541-99a7-8a454be1f621',
            licences: '["11/111"]',
            messageRef: 'water_abstraction_alert_resume_email',
            messageType: 'email',
            notifyId: '7d15c0c3-a1e6-4291-a59b-e09f49d577ed',
            notifyStatus: 'created',
            personalisation: {
              alertType: 'stop',
              licenceGaugingStationId: '76a03738-0c65-4541-99a7-8a454be1f621',
              sending_alert_type: 'resume'
            },
            plaintext: 'Dear licence contact,\r\n',
            recipient: 'hello@example.com',
            status: 'pending'
          })
        })

        it('updates the matching notification record and logs the time taken', { timeout: 3000 }, async () => {
          await ProcessNotificationStatusService.go()

          const refreshedNotification = await notification.$query()

          expect(refreshedNotification).to.equal(
            {
              eventId: event.id,
              id: notification.id,
              licenceMonitoringStationId: '76a03738-0c65-4541-99a7-8a454be1f621',
              licences: ['11/111'],
              messageRef: 'water_abstraction_alert_resume_email',
              messageType: 'email',
              notifyError: null,
              notifyId: '7d15c0c3-a1e6-4291-a59b-e09f49d577ed',
              notifyStatus: 'delivered',
              personalisation: {
                alertType: 'stop',
                licenceGaugingStationId: '76a03738-0c65-4541-99a7-8a454be1f621',
                sending_alert_type: 'resume'
              },
              plaintext: 'Dear licence contact,\r\n',
              recipient: 'hello@example.com',
              returnLogIds: null,
              status: 'sent'
            },
            { skip: ['createdAt'] }
          )

          const logDataArg = notifierStub.omg.firstCall.args[1]

          expect(notifierStub.omg.calledWith('Notification status job complete')).to.be.true()
          expect(logDataArg.timeTakenMs).to.exist()
          expect(logDataArg.timeTakenSs).to.exist()
          expect(logDataArg.count).to.exist()
        })
      })
    })

    describe('but the returned "status" is an error', () => {
      beforeEach(async () => {
        event = await EventHelper.add({
          metadata: {},
          licences: '["11/111"]',
          referenceCode: 'RINV-LX4P57',
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification'
        })

        notification = await NotificationHelper.add({
          eventId: event.id,
          licences: '["11/111"]',
          messageRef: 'returns_invitation_primary_user_email',
          messageType: 'email',
          notifyId: '9cf707f1-f4b0-466a-9879-f40953b8fecb8',
          notifyStatus: 'created',
          plaintext: 'Dear Clean Water Limited,\r\n',
          recipient: 'hello@example.com',
          status: 'pending'
        })

        response = {
          statusCode: 200,
          body: {
            status: 'temporary-failure'
          }
        }

        Sinon.stub(ViewMessageDataRequest, 'send').resolves({
          succeeded: true,
          response
        })
      })

      it('updates the matching notification record and updates the event error count', { timeout: 3000 }, async () => {
        await ProcessNotificationStatusService.go()

        const refreshedNotification = await notification.$query()

        expect(refreshedNotification).to.equal(
          {
            eventId: event.id,
            id: notification.id,
            licenceMonitoringStationId: null,
            licences: ['11/111'],
            notifyError: null,
            messageRef: 'returns_invitation_primary_user_email',
            messageType: 'email',
            notifyId: '9cf707f1-f4b0-466a-9879-f40953b8fecb8',
            notifyStatus: 'temporary-failure',
            personalisation: null,
            plaintext: 'Dear Clean Water Limited,\r\n',
            recipient: 'hello@example.com',
            returnLogIds: null,
            status: 'error'
          },
          { skip: ['createdAt'] }
        )

        const refreshedEvent = await event.$query()

        expect(refreshedEvent).to.equal(
          {
            entities: null,
            id: event.id,
            issuer: 'test.user@defra.gov.uk',
            licences: ['11/111'],
            metadata: { error: 1 },
            referenceCode: 'RINV-LX4P57',
            status: 'completed',
            subtype: 'returnInvitation',
            type: 'notification'
          },
          { skip: ['createdAt', 'updatedAt'] }
        )
      })
    })
  })

  describe('when the request to Notify for the message details fails', () => {
    beforeEach(async () => {
      event = await EventHelper.add({
        metadata: {},
        licences: '["11/111"]',
        referenceCode: 'RINV-402AGB',
        status: 'completed',
        subtype: 'returnInvitation',
        type: 'notification'
      })

      notification = await NotificationHelper.add({
        eventId: event.id,
        licences: '["11/111"]',
        messageRef: 'returns_invitation_primary_user_email',
        messageType: 'email',
        notifyId: '10076fd4-da11-43d9-b85a-f4564507d135',
        notifyStatus: 'created',
        plaintext: 'Dear Clean Water Limited,\r\n',
        recipient: 'hello@example.com',
        status: 'pending'
      })

      response = {
        statusCode: 404,
        body: {
          errors: [
            {
              error: 'NoResultFound',
              message: 'No result found'
            }
          ],
          status_code: 404
        }
      }

      Sinon.stub(ViewMessageDataRequest, 'send').resolves({
        succeeded: false,
        response
      })
    })

    it('does not update the matching notification record or the event error count', async () => {
      await ProcessNotificationStatusService.go()

      const refreshedNotification = await notification.$query()

      expect(refreshedNotification).to.equal(
        {
          eventId: event.id,
          id: notification.id,
          licences: ['11/111'],
          licenceMonitoringStationId: null,
          notifyError: null,
          messageRef: 'returns_invitation_primary_user_email',
          messageType: 'email',
          notifyId: '10076fd4-da11-43d9-b85a-f4564507d135',
          notifyStatus: 'created',
          personalisation: null,
          plaintext: 'Dear Clean Water Limited,\r\n',
          recipient: 'hello@example.com',
          returnLogIds: null,
          status: 'pending'
        },
        { skip: ['createdAt'] }
      )

      const refreshedEvent = await event.$query()

      expect(refreshedEvent).to.equal(
        {
          entities: null,
          id: event.id,
          issuer: 'test.user@defra.gov.uk',
          licences: ['11/111'],
          metadata: {},
          referenceCode: 'RINV-402AGB',
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification'
        },
        { skip: ['createdAt', 'updatedAt'] }
      )
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      Sinon.stub(FetchNotificationsService, 'go').rejects()
    })

    it('handles the error', async () => {
      await ProcessNotificationStatusService.go()

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Notification status job failed')
      expect(args[1]).to.be.null()
      expect(args[2]).to.be.an.error()
    })
  })
})
