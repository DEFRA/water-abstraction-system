// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { NOTIFICATIONS_STATUS } from 'water-abstraction-engine/lib/notifications.lib.js'

import NoticesFixture from '../../support/fixtures/notices.fixture.js'
import NotificationsFixture from '../../support/fixtures/notifications.fixture.js'
import NotifyResponseFixture from '../../support/fixtures/notify-response.fixture.js'

// Things we need to stub
import * as ViewMessageDataRequest from 'water-abstraction-engine/requests/notify/view-message-data.request.js'

// Thing under test
import SendStatusRequestService from '../../../src/services/notifications/send-status-request.service.js'

describe('Notifications - Send Status Request service', () => {
  let notice
  let notification
  let notifyResponse

  beforeEach(async () => {
    notice = NoticesFixture.returnsReminder()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the notification was an email', () => {
    beforeEach(() => {
      notification = NotificationsFixture.returnsReminderEmail(notice)
    })

    describe('and Notify responds with it was sent successfully', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns the correct notification notify response details (sent)', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.sent
        })
      })
    })

    describe('and Notify responds with it is still being processed', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'sending')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns the correct notification notify response details (pending)', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.pending
        })
      })
    })

    describe('and Notify responds with something unrecognised', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusEmailSuccessfulResponse(notice.referenceCode, 'unrecognised')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns the correct notification notify response details (pending)', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.pending
        })
      })
    })

    describe('and Notify responds with a 4xx client error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(400)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns the correct notification notify response details (error)', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          notifyError:
            '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
          status: NOTIFICATIONS_STATUS.error
        })
      })
    })

    describe('and Notify responds with a 5xx server error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns a status of pending so the check can be attempted again later', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          status: NOTIFICATIONS_STATUS.pending
        })
      })
    })

    describe('and the request fails because of a network error', () => {
      beforeEach(() => {
        notifyResponse = {
          response: new Error('Timeout awaiting request'),
          succeeded: false
        }

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns a status of pending so the check can be attempted again later', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          status: NOTIFICATIONS_STATUS.pending
        })
      })
    })
  })

  describe('when the notification was a letter', () => {
    beforeEach(() => {
      notification = NotificationsFixture.returnsReminderLetter(notice)
    })

    describe('and Notify responds with it was sent successfully', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns the correct notification notify response details (sent)', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.sent
        })
      })
    })

    describe('and Notify responds with it is still being processed', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode, 'accepted')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns the correct notification notify response details (pending)', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.pending
        })
      })
    })

    describe('and Notify responds with something unrecognised', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusLetterSuccessfulResponse(notice.referenceCode, 'unrecognised')

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns the correct notification notify response details (pending)', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          notifyId: notifyResponse.response.body.id,
          notifyStatus: notifyResponse.response.body.status,
          status: NOTIFICATIONS_STATUS.pending
        })
      })
    })

    describe('and Notify responds with a 4xx client error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(400)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns the correct notification notify response details (error)', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          notifyError:
            '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
          status: NOTIFICATIONS_STATUS.error
        })
      })
    })

    describe('and Notify responds with a 5xx server error', () => {
      beforeEach(() => {
        notifyResponse = NotifyResponseFixture.statusErrorResponse(500)

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns a status of pending so the check can be attempted again later', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          status: NOTIFICATIONS_STATUS.pending
        })
      })
    })

    describe('and the request fails because of a network error', () => {
      beforeEach(() => {
        notifyResponse = {
          response: new Error('Timeout awaiting request'),
          succeeded: false
        }

        vi.spyOn(ViewMessageDataRequest, 'default').mockResolvedValue(notifyResponse)
      })

      it('returns a status of pending so the check can be attempted again later', async () => {
        const result = await SendStatusRequestService(notification)

        expect(result).toEqual({
          id: notification.id,
          status: NOTIFICATIONS_STATUS.pending
        })
      })
    })
  })
})
