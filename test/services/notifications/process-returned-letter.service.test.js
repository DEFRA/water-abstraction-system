// Test framework dependencies
import { generateNoticeReferenceCode, generateUUID, today } from '../../../app/lib/general.lib.js'

// Test helpers
import * as NotificationHelper from '../../support/helpers/notification.helper.js'

// Things we need to stub
import * as UpdateNoticeService from '../../../app/services/notices/update-notice.service.js'
import GlobalNotifierStub from '../../support/stubs/global-notifier.stub.js'

// Thing under test
import ProcessReturnedLetterService from '../../../app/services/notifications/process-returned-letter.service.js'

describe('Notifications - Process Returned Letter service', () => {
  const todaysDate = today()

  let notification
  let notifierStub
  let payload
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

    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

      vi.spyOn(UpdateNoticeService, 'default').mockResolvedValue()
    })

    it('updates "status" to returned and "returnedAt" to current date on the matching notification', async () => {
      await ProcessReturnedLetterService(payload)

      const refreshedNotification = await notification.$query()

      expect(refreshedNotification.status).toEqual('returned')
      expect(refreshedNotification.returnedAt).toEqual(todaysDate)
    })

    it('updates the linked notice to recalculate its overall status and status counts', async () => {
      await ProcessReturnedLetterService(payload)

      expect(UpdateNoticeService.default).toHaveBeenCalledWith([notification.eventId])
    })

    it('logs the time taken in milliseconds and seconds, plus the payload and matching notification', async () => {
      await ProcessReturnedLetterService(payload)

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Returned letter complete', expect.any(Object))
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

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Returned letter complete', expect.any(Object))
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

      vi.spyOn(UpdateNoticeService, 'default').mockRejectedValue(new Error())
    })

    it('does not throw an error', async () => {
      await ProcessReturnedLetterService(payload)
    })

    it('logs the error', async () => {
      await ProcessReturnedLetterService(payload)

      const errorLogArgs = notifierStub.omfg.mock.calls[0]

      expect(notifierStub.omfg).toHaveBeenCalledWith('Returned letter failed', expect.any(Object), expect.any(Error))
      expect(errorLogArgs[1]).toEqual(payload)
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })
  })
})
