// Things we need to stub
import * as FetchDownloadNotificationService from '../../../app/services/notifications/fetch-notification-download.service.js'

// Thing under test
import DownloadNotificationService from '../../../app/services/notifications/download-notification.service.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

describe('Notifications - Download Notification service', () => {
  let notificationId
  let pdf

  beforeEach(async () => {
    notificationId = generateUUID()

    pdf = Buffer.from('mock file')

    vi.spyOn(FetchDownloadNotificationService, 'default').mockResolvedValue({ pdf })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns pdf data', async () => {
      const result = await DownloadNotificationService(notificationId)

      expect(result).toEqual(pdf)
    })
  })
})
