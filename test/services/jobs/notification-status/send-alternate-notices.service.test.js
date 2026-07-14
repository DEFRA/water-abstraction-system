// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchCriticalNoticesDal from '../../../../app/dal/jobs/notification-status/fetch-critical-notices.dal.js'
import * as SendAlternateNoticeService from '../../../../app/services/notices/setup/send/send-alternate-notice.service.js'

// Thing under test
import SendAlternateNoticesService from '../../../../app/services/jobs/notification-status/send-alternate-notices.service.js'

describe('Job - Notifications - Send Alternate Notices service', () => {
  let criticalNotices
  let notifications
  beforeEach(async () => {
    notifications = [
      { id: generateUUID(), eventId: generateUUID() },
      { id: generateUUID(), eventId: generateUUID() },
      { id: generateUUID(), eventId: generateUUID() }
    ]

    vi.spyOn(SendAlternateNoticeService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the notifications are linked to critical notices with errors', () => {
    beforeEach(() => {
      criticalNotices = [{ id: notifications[1].eventId }, { id: notifications[2].eventId }]

      vi.spyOn(FetchCriticalNoticesDal, 'default').mockResolvedValue(criticalNotices)
    })

    it('sends an alternate notice', async () => {
      await SendAlternateNoticesService(notifications)

      expect(SendAlternateNoticeService.default).toHaveBeenCalled()
      expect(SendAlternateNoticeService.default.mock.calls[0][0]).toEqual(criticalNotices[0])
      expect(SendAlternateNoticeService.default.mock.calls[1][0]).toEqual(criticalNotices[1])
    })
  })

  describe('when the notifications are not linked to critical notices with errors', () => {
    beforeEach(() => {
      vi.spyOn(FetchCriticalNoticesDal, 'default').mockResolvedValue([])
    })

    it('does not send an alternate notice', async () => {
      await SendAlternateNoticesService(notifications)

      expect(SendAlternateNoticeService.default).not.toHaveBeenCalled()
    })
  })
})
