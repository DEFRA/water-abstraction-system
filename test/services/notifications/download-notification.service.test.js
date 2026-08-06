// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as FetchDownloadNotificationService from '../../../src/services/notifications/fetch-notification-download.service.js'

// Thing under test
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import DownloadNotificationService from '../../../src/services/notifications/download-notification.service.js'

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
