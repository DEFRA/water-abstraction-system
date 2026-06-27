'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NoticesFixture = require('../../../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../support/fixtures/notifications.fixture.js')

// Things we need to stub
const GlobalNotifierStub = require('../../../../support/stubs/global-notifier.stub.js')
const SendAlternateNoticeService = require('../../../../../app/services/notices/setup/send/send-alternate-notice.service.js')
const SendMainNoticeService = require('../../../../../app/services/notices/setup/send/send-main-notice.service.js')
const UpdateNoticeService = require('../../../../../app/services/notices/update-notice.service.js')

// Thing under test
const SendNoticeService = require('../../../../../app/services/notices/setup/send/send-notice.service.js')

describe('Notices - Setup - Send - Send Notice service', () => {
  let notice
  let notifications
  let notifierStub
  let sendAlternateNoticeStub
  let sendMainNoticeStub
  let updateEventServiceStub

  beforeEach(() => {
    sendMainNoticeStub = Sinon.stub(SendMainNoticeService, 'go').resolves()
    updateEventServiceStub = Sinon.stub(UpdateNoticeService, 'go').resolves()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      sendAlternateNoticeStub = Sinon.stub(SendAlternateNoticeService, 'go').resolves({
        id: '270d3a69-4cf7-4c90-8459-fbc35d725bd6'
      })
    })

    describe('and the notice is a returns invitation', () => {
      beforeEach(() => {
        notice = NoticesFixture.returnsInvitation()
        notifications = [NotificationsFixture.returnsInvitationEmail(notice)]
      })

      it('sends the main notice', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(sendMainNoticeStub.calledOnce).toBe(true)
        expect(sendMainNoticeStub.firstCall.args[0]).toEqual(notice)
        expect(sendMainNoticeStub.firstCall.args[1]).toEqual(notifications)
      })

      it('checks the main notice for the need to send an alternate notice', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(sendAlternateNoticeStub.calledOnce).toBe(true)
        expect(sendMainNoticeStub.firstCall.args[0]).toEqual(notice)
      })

      it('updates both the main and alternate notices', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(updateEventServiceStub.calledOnce).toBe(true)
        expect(updateEventServiceStub.firstCall.args[0]).toEqual([notice.id, '270d3a69-4cf7-4c90-8459-fbc35d725bd6'])
      })

      it('logs the time taken', async () => {
        await SendNoticeService.go(notice, notifications)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).toEqual('Send notice complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].count).toEqual(1)
        expect(args[1].noticeId).toEqual(notice.id)
      })
    })

    describe('and the notice is a renewal invitation', () => {
      beforeEach(() => {
        notice = NoticesFixture.renewalInvitation()
        notifications = [NotificationsFixture.renewalInvitationEmail(notice)]
      })

      it('sends the main notice', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(sendMainNoticeStub.calledOnce).toBe(true)
        expect(sendMainNoticeStub.firstCall.args[0]).toEqual(notice)
        expect(sendMainNoticeStub.firstCall.args[1]).toEqual(notifications)
      })

      it('checks the main notice for the need to send an alternate notice', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(sendAlternateNoticeStub.calledOnce).toBe(true)
        expect(sendMainNoticeStub.firstCall.args[0]).toEqual(notice)
      })

      it('updates both the main and alternate notices', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(updateEventServiceStub.calledOnce).toBe(true)
        expect(updateEventServiceStub.firstCall.args[0]).toEqual([notice.id, '270d3a69-4cf7-4c90-8459-fbc35d725bd6'])
      })
    })

    describe('and the notice is NOT a returns or renewal invitation', () => {
      beforeEach(() => {
        notice = NoticesFixture.returnsReminder()
        notifications = [NotificationsFixture.returnsReminderEmail(notice)]
      })

      it('sends the main notice', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(sendMainNoticeStub.calledOnce).toBe(true)
        expect(sendMainNoticeStub.firstCall.args[0]).toEqual(notice)
        expect(sendMainNoticeStub.firstCall.args[1]).toEqual(notifications)
      })

      it('does not attempt to send an alternate notice', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(sendAlternateNoticeStub.called).toBe(false)
      })

      it('only updates the main notice', async () => {
        await SendNoticeService.go(notice, notifications)

        expect(updateEventServiceStub.calledOnce).toBe(true)
        expect(updateEventServiceStub.firstCall.args[0]).toEqual([notice.id])
      })

      it('logs the time taken', async () => {
        await SendNoticeService.go(notice, notifications)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).toEqual('Send notice complete')
        expect(args[1].timeTakenMs).toBeDefined()
        expect(args[1].count).toEqual(1)
        expect(args[1].noticeId).toEqual(notice.id)
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()
      notifications = [NotificationsFixture.returnsInvitationEmail(notice)]

      Sinon.stub(SendAlternateNoticeService, 'go').rejects('Computer says no')
    })

    it('logs the error', async () => {
      await SendNoticeService.go(notice, notifications)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).toEqual('Send notice failed')
      expect(args[1].notice.id).toEqual(notice.id)
      expect(args[2]).toBeInstanceOf(Error)
      expect(args[2].name).toEqual('Computer says no')
    })
  })
})
