'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationHelper = require('../../support/helpers/notification.helper.js')

// Thing under test
const DownloadNotificationService = require('../../../app/services/notifications/download-notification.service.js')

describe('Notifications - Download Notification service', () => {
  let notification
  let pdf

  beforeEach(async () => {
    pdf = Buffer.from('mock file')

    notification = await NotificationHelper.add({
      pdf
    })
  })

  describe('when called', () => {
    it('returns pdf data', async () => {
      const result = await DownloadNotificationService.go(notification.id)

      expect(result).to.equal(pdf)
    })
  })
})
