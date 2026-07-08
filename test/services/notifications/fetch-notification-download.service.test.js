'use strict'

// Test helpers
const NotificationHelper = require('../../support/helpers/notification.helper.js')

// Thing under test
const FetchDownloadNotificationService = require('../../../app/services/notifications/fetch-notification-download.service.js')

describe('Notifications - Fetch Download Notification service', () => {
  let notification
  let pdf

  beforeEach(async () => {
    pdf = Buffer.from('mock file')

    notification = await NotificationHelper.add({
      pdf
    })
  })

  it('returns the PDF file for the notification', async () => {
    const result = await FetchDownloadNotificationService(notification.id)

    expect(result).toEqual({
      pdf
    })
  })
})
