'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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
    const result = await FetchDownloadNotificationService.go(notification.id)

    expect(result).to.equal({
      pdf
    })
  })
})
