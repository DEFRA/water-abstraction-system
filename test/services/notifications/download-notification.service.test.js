'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const FetchDownloadNotificationService = require('../../../app/services/notifications/fetch-notification-download.service.js')

// Thing under test
const DownloadNotificationService = require('../../../app/services/notifications/download-notification.service.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

describe('Notifications - Download Notification service', () => {
  let notificationId
  let pdf

  beforeEach(async () => {
    notificationId = generateUUID()

    pdf = Buffer.from('mock file')

    Sinon.stub(FetchDownloadNotificationService, 'go').resolves({ pdf })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns pdf data', async () => {
      const result = await DownloadNotificationService(notificationId)

      expect(result).toEqual(pdf)
    })
  })
})
