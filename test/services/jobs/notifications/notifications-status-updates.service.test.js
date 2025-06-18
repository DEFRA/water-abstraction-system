'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const LicenceMonitoringStationHelper = require('../../../support/helpers/licence-monitoring-station.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const NotifyConfig = require('../../../../config/notify.config.js')
const { NotifyClient } = require('notifications-node-client')

// Thing under test
const ProcessNotificationsStatusUpdatesService = require('../../../../app/services/jobs/notifications/notifications-status-updates.service.js')

describe('Job - Notifications - Process notifications status updates service', () => {
  const ONE_HUNDRED_MILLISECONDS = 100

  let clock
  let date
  let event
  let notification
  let notification2
  let notifierStub

  beforeEach(async () => {
    // By setting the batch size to 1 we can prove that all the batches are run, as we should have all the notifications
    // still updated in the database regardless of batch size
    Sinon.stub(NotifyConfig, 'batchSize').value(1)
    // By setting the delay to 100ms we can keep the tests fast whilst assuring our batch mechanism is delaying
    // correctly, we do not want increase the timeout for the test as we want them to fail if a timeout occurs
    Sinon.stub(NotifyConfig, 'delay').value(ONE_HUNDRED_MILLISECONDS)

    if (NotifyClient.prototype.getNotificationById.restore) {
      NotifyClient.prototype.getNotificationById.restore()
    }

    event = await EventHelper.add({
      metadata: {},
      status: 'completed',
      type: 'notification'
    })

    notification = await NotificationHelper.add({
      eventId: event.id,
      status: 'pending',
      notifyStatus: 'created',
      createdAt: timestampForPostgres()
    })

    notification2 = await NotificationHelper.add({
      eventId: event.id,
      status: 'pending',
      notifyStatus: 'created',
      createdAt: timestampForPostgres()
    })

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    date = new Date(`2025-01-01`)
    clock = Sinon.useFakeTimers(date)
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
    delete global.GlobalNotifier
  })

  describe('when the status update is successful', () => {
    beforeEach(async () => {
      Sinon.stub(NotifyClient.prototype, 'getNotificationById').resolves({
        data: {
          status: 'received'
        }
      })
    })

    it('updates the first notification data', { timeout: 3000 }, async () => {
      await ProcessNotificationsStatusUpdatesService.go()

      const updatedResult = await notification.$query()

      expect(updatedResult.notifyStatus).to.equal('received')
      expect(updatedResult.status).to.equal('sent')

      expect(updatedResult).to.equal({
        createdAt: notification.createdAt,
        eventId: event.id,
        id: notification.id,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: 'received',
        personalisation: null,
        plaintext: null,
        recipient: null,
        status: 'sent'
      })
    })

    it('updates the second notification data', async () => {
      await ProcessNotificationsStatusUpdatesService.go()

      const updatedResult = await notification2.$query()

      expect(updatedResult.notifyStatus).to.equal('received')
      expect(updatedResult.status).to.equal('sent')

      expect(updatedResult).to.equal({
        createdAt: notification2.createdAt,
        eventId: event.id,
        id: notification2.id,
        licences: null,
        notifyError: null,
        messageRef: null,
        messageType: null,
        notifyId: null,
        notifyStatus: 'received',
        personalisation: null,
        plaintext: null,
        recipient: null,
        status: 'sent'
      })
    })

    describe('and the notification type is a water abstraction alert', () => {
      let abstractionNotification
      let licenceMonitoringStation

      beforeEach(async () => {
        licenceMonitoringStation = await LicenceMonitoringStationHelper.add()

        abstractionNotification = await NotificationHelper.add({
          eventId: event.id,
          status: 'pending',
          notifyStatus: 'created',
          messageRef: 'water_abstraction_alert_resume_email',
          personalisation: {
            alertType: 'resume',
            licenceMonitoringStationId: licenceMonitoringStation.id
          },
          createdAt: timestampForPostgres()
        })
      })

      it('updates the abstraction notification data', async () => {
        await ProcessNotificationsStatusUpdatesService.go()

        const updatedResult = await abstractionNotification.$query()

        expect(updatedResult.notifyStatus).to.equal('received')
        expect(updatedResult.status).to.equal('sent')

        expect(updatedResult).to.equal({
          createdAt: abstractionNotification.createdAt,
          eventId: event.id,
          id: abstractionNotification.id,
          licences: null,
          messageRef: 'water_abstraction_alert_resume_email',
          messageType: null,
          notifyError: null,
          notifyId: null,
          notifyStatus: 'received',
          personalisation: { alertType: 'resume', licenceMonitoringStationId: licenceMonitoringStation.id },
          plaintext: null,
          recipient: null,
          status: 'sent'
        })
      })

      it('updates the "status" and "statusUpdatedAt"', async () => {
        await ProcessNotificationsStatusUpdatesService.go()

        const updatedResult = await licenceMonitoringStation.$query()

        expect(updatedResult.status).to.equal('resume')
        expect(updatedResult.statusUpdatedAt).to.equal(date)
      })
    })
  })

  describe('when notify returns a status error', () => {
    beforeEach(() => {
      Sinon.stub(NotifyClient.prototype, 'getNotificationById')
        .onFirstCall()
        .resolves({
          data: {
            status: 'temporary-failure'
          }
        })
        .resolves({
          data: {
            status: 'received'
          }
        })
    })

    it('updates the event error count ', async () => {
      await ProcessNotificationsStatusUpdatesService.go()

      const refreshedEvent = await event.$query()

      expect(refreshedEvent).to.equal({
        ...event,
        metadata: { error: 1 }
      })
    })
  })

  describe('when Notify returns an error (4xx, 5xx)', () => {
    beforeEach(() => {
      Sinon.stub(NotifyClient.prototype, 'getNotificationById').rejects({
        status: 404,
        message: 'Request failed with status code 404',
        response: {
          data: {
            errors: [
              {
                error: 'NoResultFound',
                message: 'No result found'
              }
            ]
          }
        }
      })
    })

    it('should not update the "notification"', async () => {
      await ProcessNotificationsStatusUpdatesService.go()

      const refreshNotification = await notification.$query()

      expect(refreshNotification.notifyStatus).to.equal('created')
      expect(refreshNotification.status).to.equal('pending')

      expect(refreshNotification).to.equal(notification)
    })
  })
})
