'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCriticalNoticesDal = require('../../../../app/dal/jobs/notification-status/fetch-critical-notices.dal.js')
const SendAlternateNoticeService = require('../../../../app/services/notices/setup/send/send-alternate-notice.service.js')

// Thing under test
const SendAlternateNoticesService = require('../../../../app/services/jobs/notification-status/send-alternate-notices.service.js')

describe('Job - Notifications - Send Alternate Notices service', () => {
  let criticalNotices
  let notifications
  let sendAlternateNoticeStub

  beforeEach(async () => {
    notifications = [
      { id: generateUUID(), eventId: generateUUID() },
      { id: generateUUID(), eventId: generateUUID() },
      { id: generateUUID(), eventId: generateUUID() }
    ]

    sendAlternateNoticeStub = Sinon.stub(SendAlternateNoticeService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the notifications are linked to critical notices with errors', () => {
    beforeEach(() => {
      criticalNotices = [{ id: notifications[1].eventId }, { id: notifications[2].eventId }]

      Sinon.stub(FetchCriticalNoticesDal, 'go').resolves(criticalNotices)
    })

    it('sends an alternate notice', async () => {
      await SendAlternateNoticesService.go(notifications)

      expect(sendAlternateNoticeStub.called).toBe(true)
      expect(sendAlternateNoticeStub.firstCall.args[0]).toEqual(criticalNotices[0])
      expect(sendAlternateNoticeStub.secondCall.args[0]).toEqual(criticalNotices[1])
    })
  })

  describe('when the notifications are not linked to critical notices with errors', () => {
    beforeEach(() => {
      Sinon.stub(FetchCriticalNoticesDal, 'go').resolves([])
    })

    it('does not send an alternate notice', async () => {
      await SendAlternateNoticesService.go(notifications)

      expect(sendAlternateNoticeStub.called).toBe(false)
    })
  })
})
