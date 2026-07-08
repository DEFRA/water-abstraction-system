// Test framework dependencies

import { generateUUID, today } from '../../../app/lib/general.lib.js'

// Test helpers
import * as NotificationHelper from '../../support/helpers/notification.helper.js'
import { generateNoticeReferenceCode } from '../../../app/lib/general.lib.js'

// Things we need to stub
import GlobalNotifierStub from '../../support/stubs/global-notifier.stub.js'
import UpdateNoticeService from '../../../app/services/notices/update-notice.service.js'

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

      vi.mock('../../../app/services/notices/update-notice.service.js')
      UpdateNoticeService.mockResolvedValue()
    })

    it('updates "status" to returned and "returnedAt" to current date on the matching notification', async () => {
      await ProcessReturnedLetterService(payload)

      const refreshedNotification = await notification.$query()

      expect(refreshedNotification.status).toEqual('returned')
      expect(refreshedNotification.returnedAt).toEqual(todaysDate)
    })

    it('updates the linked notice to recalculate its overall status and status counts', async () => {
      await ProcessReturnedLetterService(payload)

      expect(UpdateNoticeService).toHaveBeenCalledWith([notification.eventId])
    })

    it('logs the time taken in milliseconds and seconds, plus the payload and matching notification', async () => {
      await ProcessReturnedLetterService(payload)

      const logDataArg = notifierStub.omg.mock.calls[0][1]

      expect(notifierStub.omg).toHaveBeenCalledWith('Returned letter complete')
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

      expect(notifierStub.omg).toHaveBeenCalledWith('Returned letter complete')
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

      vi.mock('../../../app/services/notices/update-notice.service.js')
      UpdateNoticeService.mockRejectedValue()
    })

    it('does not throw an error', async () => {
      await ProcessReturnedLetterService(payload)
    })

    it('logs the error', async () => {
      await ProcessReturnedLetterService(payload)

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg).toHaveBeenCalledWith('Returned letter failed')
      expect(errorLogArgs[1]).toEqual(payload)
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })
  })
})
