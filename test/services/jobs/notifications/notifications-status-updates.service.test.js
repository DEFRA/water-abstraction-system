'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const ScheduledNotificationHelper = require('../../../support/helpers/scheduled-notification.helper.js')
const ScheduledNotificationModel = require('../../../../app/models/scheduled-notification.model.js')
const { stubNotify } = require('../../../../config/notify.config.js')
const { timestampForPostgres } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const { NotifyClient } = require('notifications-node-client')

// Thing under test
const ProcessNotificationsStatusUpdatesService = require('../../../../app/services/jobs/notifications/notifications-status-updates.service.js')

describe('Job - Notifications - Process notifications status updates service', () => {
  let event
  let scheduledNotification

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      status: 'completed'
    })

    scheduledNotification = await ScheduledNotificationHelper.add({
      eventId: event.id,
      status: 'sending',
      notifyStatus: 'created',
      createdAt: timestampForPostgres()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the status update is successful', () => {
    beforeEach(() => {
      _stubSuccessfulNotify()
    })

    it('returns the data', async () => {
      await ProcessNotificationsStatusUpdatesService.go()

      const updatedResult = await scheduledNotification.$query()

      expect(updatedResult.notifyStatus).to.equal('received')
      expect(updatedResult.status).to.equal('sent')

      expect(updatedResult).to.equal({
        companyId: null,
        createdAt: scheduledNotification.createdAt,
        eventId: event.id,
        id: scheduledNotification.id,
        individualId: null,
        jobId: null,
        licences: null,
        log: null,
        messageRef: null,
        messageType: null,
        metadata: null,
        nextStatusCheck: null,
        notificationType: null,
        notifyId: null,
        notifyStatus: 'received',
        personalisation: null,
        plaintext: null,
        recipient: null,
        sendAfter: null,
        status: 'sent',
        statusChecks: null
      })
    })
  })

  describe('when Notify returns an error (4xx, 5xx)', () => {
    beforeEach(() => {
      _stubUnSuccessfulNotify()
    })

    it('should not update the "scheduledNotification"', async () => {
      await ProcessNotificationsStatusUpdatesService.go()

      const result = await ScheduledNotificationModel.query().findById(scheduledNotification.id)

      expect(result.notifyStatus).to.equal('created')
      expect(result.status).to.equal('sending')

      expect(result).to.equal(scheduledNotification)
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
