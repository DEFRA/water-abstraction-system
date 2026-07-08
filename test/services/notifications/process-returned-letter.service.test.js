'use strict'

// Test framework dependencies
const Sinon = require('sinon')

const { generateUUID, today } = require('../../../app/lib/general.lib.js')

// Test helpers
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const { generateNoticeReferenceCode } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const GlobalNotifierStub = require('../../support/stubs/global-notifier.stub.js')
const UpdateNoticeService = require('../../../app/services/notices/update-notice.service.js')

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
      messageRef: 'returns reminder',
      notifyId: generateUUID(),
      notifyStatus: 'sent',
      recipient: null,
      status: 'sent'
    })

    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete globalThis.GlobalNotifier

    if (notification) {
      notification.$query().delete()
    }
  })

  describe('when called with a matching "notifyId"', () => {
    beforeEach(async () => {
      payload = {
        notification_id: notification.notifyId,
        reference: generateNoticeReferenceCode('RREM-')
      }

      updateEventStub = Sinon.stub(UpdateNoticeService, 'go').resolves()
    })

    it('updates "status" to returned and "returnedAt" to current date on the matching notification', async () => {
      await ProcessReturnedLetterService(payload)

      const refreshedNotification = await notification.$query()

      expect(refreshedNotification.status).toEqual('returned')
      expect(refreshedNotification.returnedAt).toEqual(todaysDate)
    })

    it('updates the linked notice to recalculate its overall status and status counts', async () => {
      await ProcessReturnedLetterService(payload)

      expect(updateEventStub.calledWith([notification.eventId])).toBe(true)
    })

    it('logs the time taken in milliseconds and seconds, plus the payload and matching notification', async () => {
      await ProcessReturnedLetterService(payload)

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Returned letter complete')).toBe(true)
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.payload).toEqual(payload)
      expect(logDataArg.notification).toEqual({
        id: notification.id,
        eventId: notification.eventId
      })
    })
  })

  describe('when called with a "notifyId" that finds no match', () => {
    beforeEach(async () => {
      payload = {
        notification_id: generateUUID(),
        reference: generateNoticeReferenceCode('RREM-')
      }
    })

    it('logs the time taken in milliseconds and seconds, plus the payload and an empty notification', async () => {
      await ProcessReturnedLetterService(payload)

      const logDataArg = notifierStub.omg.firstCall.args[1]

      expect(notifierStub.omg.calledWith('Returned letter complete')).toBe(true)
      expect(logDataArg.timeTakenMs).toBeDefined()
      expect(logDataArg.timeTakenSs).toBeDefined()
      expect(logDataArg.payload).toEqual(payload)
      expect(logDataArg.notification).toEqual({})
    })
  })

  describe('when the process errors', () => {
    beforeEach(async () => {
      payload = {
        notification_id: notification.notifyId,
        reference: generateNoticeReferenceCode('RREM-')
      }

      Sinon.stub(UpdateNoticeService, 'go').rejects()
    })

    it('does not throw an error', async () => {
      await ProcessReturnedLetterService(payload)
    })

    it('logs the error', async () => {
      await ProcessReturnedLetterService(payload)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Returned letter failed')).toBe(true)
      expect(errorLogArgs[1]).toEqual(payload)
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })
  })
})
