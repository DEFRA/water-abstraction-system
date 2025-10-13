'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID, today } = require('../../../app/lib/general.lib.js')

// Test helpers
const NotificationHelper = require('../../support/helpers/notification.helper.js')

// Things we need to stub
const UpdateEventService = require('../../../app/services/jobs/notification-status/update-event.service.js')

// Thing under test
const ProcessReturnedLetterService = require('../../../app/services/notifications/process-returned-letter.service.js')

describe('Notifications - Process Returned Letter service', () => {
  const todaysDate = today()

  let notification
  let notifierStub
  let payload
  let updateEventStub

  beforeEach(async () => {
    notification = await NotificationHelper.add({
      eventId: generateUUID(),
      messageType: 'letter',
      messageRef: 'returns_reminder_licence_holder_letter',
      notifyId: generateUUID(),
      notifyStatus: 'sent',
      recipient: null,
      status: 'sent'
    })

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier

    if (notification) {
      notification.$query().delete()
    }
  })

  describe('when called with a matching "notifyId"', () => {
    beforeEach(async () => {
      payload = {
        notification_id: notification.notifyId,
        reference: NotificationHelper.generateReferenceCode('RREM')
      }

      updateEventStub = Sinon.stub(UpdateEventService, 'go').resolves()
    })

    it('updates "status" to returned and "returnedAt" to current date on the matching notification', async () => {
      await ProcessReturnedLetterService.go(payload)

      const refreshedNotification = await notification.$query()

      expect(refreshedNotification.status).to.equal('returned')
      expect(refreshedNotification.returnedAt).to.equal(todaysDate)
    })

    it('updates the linked notice to recalculate its overall status and status counts', async () => {
      await ProcessReturnedLetterService.go(payload)

      expect(updateEventStub.calledWith([notification.eventId])).to.be.true()
    })

    it('logs the time taken in milliseconds and seconds, plus the payload and matching notification', async () => {
      await ProcessReturnedLetterService.go(payload)

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Returned letter complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.payload).to.equal(payload)
      expect(logDataArg.notification).to.equal({
        id: notification.id,
        eventId: notification.eventId
      })
    })
  })

  describe('when called with a "notifyId" that finds no match', () => {
    beforeEach(async () => {
      payload = {
        notification_id: generateUUID(),
        reference: NotificationHelper.generateReferenceCode('RREM')
      }
    })

    it('logs the time taken in milliseconds and seconds, plus the payload and an empty notification', async () => {
      await ProcessReturnedLetterService.go(payload)

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Returned letter complete')).to.be.true()
      expect(logDataArg.timeTakenMs).to.exist()
      expect(logDataArg.timeTakenSs).to.exist()
      expect(logDataArg.payload).to.equal(payload)
      expect(logDataArg.notification).to.equal({})
    })
  })

  describe('when the process errors', () => {
    beforeEach(async () => {
      payload = {
        notification_id: notification.notifyId,
        reference: NotificationHelper.generateReferenceCode('RREM')
      }

      Sinon.stub(UpdateEventService, 'go').rejects()
    })

    it('does not throw an error', async () => {
      await expect(ProcessReturnedLetterService.go(payload)).not.to.reject()
    })

    it('logs the error', async () => {
      await ProcessReturnedLetterService.go(payload)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Returned letter failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal(payload)
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })
  })
})
