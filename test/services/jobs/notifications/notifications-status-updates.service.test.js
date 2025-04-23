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
const { stubNotify } = require('../../../../config/notify.config.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const NotifyConfig = require('../../../../config/notify.config.js')
const { NotifyClient } = require('notifications-node-client')

// Thing under test
const ProcessNotificationsStatusUpdatesService = require('../../../../app/services/jobs/notifications/notifications-status-updates.service.js')

describe('Job - Notifications - Process notifications status updates service', () => {
  const ONE_HUNDRED_MILLISECONDS = 100

  let event
  let notifierStub
  let notification
  let notification2

  beforeEach(async () => {
    // By setting the batch size to 1 we can prove that all the batches are run, as we should have all the notifications
    // still updated in the database regardless of batch size
    Sinon.stub(NotifyConfig, 'batchSize').value(1)
    // By setting the delay to 100ms we can keep the tests fast whilst assuring our batch mechanism is delaying
    // correctly, we do not want increase the timeout for the test as we want them to fail if a timeout occurs
    Sinon.stub(NotifyConfig, 'delay').value(ONE_HUNDRED_MILLISECONDS)

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
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the status update is successful', () => {
    beforeEach(() => {
      _stubSuccessfulNotify()
    })

    it('returns the first notification data', { timeout: 3000 }, async () => {
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

    it('returns the second notification data', async () => {
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
  })

  describe('when notify returns a status error', () => {
    beforeEach(() => {
      if (stubNotify) {
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
      }
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
      _stubUnSuccessfulNotify()
    })

    it('should not update the "notification"', async () => {
      await ProcessNotificationsStatusUpdatesService.go()

      const refreshnotification = await notification.$query()

      expect(refreshnotification.notifyStatus).to.equal('created')
      expect(refreshnotification.status).to.equal('pending')

      expect(refreshnotification).to.equal(notification)
    })
  })
})

function _stubSuccessfulNotify() {
  if (stubNotify) {
    Sinon.stub(NotifyClient.prototype, 'getNotificationById').resolves({
      data: {
        status: 'received'
      }
    })
  }
}

function _stubUnSuccessfulNotify() {
  if (stubNotify) {
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
  }
}
