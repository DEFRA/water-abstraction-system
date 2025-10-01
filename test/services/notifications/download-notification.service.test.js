'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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
      const result = await DownloadNotificationService.go(notificationId)

      expect(result).to.equal(pdf)
    })
  })
})
