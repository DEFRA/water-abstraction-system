// Test framework dependencies

// Test helpers
import * as NoticesFixture from '../../../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'

// Things we need to stub
import GlobalNotifierStub from '../../../../support/stubs/global-notifier.stub.js'
import * as SendAlternateNoticeService from '../../../../../app/services/notices/setup/send/send-alternate-notice.service.js'
import * as SendMainNoticeService from '../../../../../app/services/notices/setup/send/send-main-notice.service.js'
import * as UpdateNoticeService from '../../../../../app/services/notices/update-notice.service.js'

// Thing under test
import SendNoticeService from '../../../../../app/services/notices/setup/send/send-notice.service.js'

describe('Notices - Setup - Send - Send Notice service', () => {
  let notice
  let notifications
  let notifierStub
  beforeEach(() => {
    vi.spyOn(SendMainNoticeService, 'default').mockResolvedValue()
    vi.spyOn(UpdateNoticeService, 'default').mockResolvedValue()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      vi.spyOn(SendAlternateNoticeService, 'default').mockResolvedValue({
        id: '270d3a69-4cf7-4c90-8459-fbc35d725bd6'
      })
    })

    describe('and the notice is a returns invitation', () => {
      beforeEach(() => {
        notice = NoticesFixture.returnsInvitation()
        notifications = [NotificationsFixture.returnsInvitationEmail(notice)]
      })

      it('sends the main notice', async () => {
        await SendNoticeService(notice, notifications)

        expect(SendMainNoticeService.default).toHaveBeenCalledOnce()
        expect(SendMainNoticeService.default.mock.calls[0][0]).toEqual(notice)
        expect(SendMainNoticeService.default.mock.calls[0][1]).toEqual(notifications)
      })

      it('checks the main notice for the need to send an alternate notice', async () => {
        await SendNoticeService(notice, notifications)

        expect(SendAlternateNoticeService.default).toHaveBeenCalledOnce()
        expect(SendMainNoticeService.default.mock.calls[0][0]).toEqual(notice)
      })

      it('updates both the main and alternate notices', async () => {
        await SendNoticeService(notice, notifications)

        expect(UpdateNoticeService.default).toHaveBeenCalledOnce()
        expect(UpdateNoticeService.default.mock.calls[0][0]).toEqual([
          notice.id,
          '270d3a69-4cf7-4c90-8459-fbc35d725bd6'
        ])
      })

      it('logs the time taken', async () => {
        await SendNoticeService(notice, notifications)

        const args = notifierStub.omg.mock.calls[0]

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
        await SendNoticeService(notice, notifications)

        expect(SendMainNoticeService.default).toHaveBeenCalledOnce()
        expect(SendMainNoticeService.default.mock.calls[0][0]).toEqual(notice)
        expect(SendMainNoticeService.default.mock.calls[0][1]).toEqual(notifications)
      })

      it('checks the main notice for the need to send an alternate notice', async () => {
        await SendNoticeService(notice, notifications)

        expect(SendAlternateNoticeService.default).toHaveBeenCalledOnce()
        expect(SendMainNoticeService.default.mock.calls[0][0]).toEqual(notice)
      })

      it('updates both the main and alternate notices', async () => {
        await SendNoticeService(notice, notifications)

        expect(UpdateNoticeService.default).toHaveBeenCalledOnce()
        expect(UpdateNoticeService.default.mock.calls[0][0]).toEqual([
          notice.id,
          '270d3a69-4cf7-4c90-8459-fbc35d725bd6'
        ])
      })
    })

    describe('and the notice is NOT a returns or renewal invitation', () => {
      beforeEach(() => {
        notice = NoticesFixture.returnsReminder()
        notifications = [NotificationsFixture.returnsReminderEmail(notice)]
      })

      it('sends the main notice', async () => {
        await SendNoticeService(notice, notifications)

        expect(SendMainNoticeService.default).toHaveBeenCalledOnce()
        expect(SendMainNoticeService.default.mock.calls[0][0]).toEqual(notice)
        expect(SendMainNoticeService.default.mock.calls[0][1]).toEqual(notifications)
      })

      it('does not attempt to send an alternate notice', async () => {
        await SendNoticeService(notice, notifications)

        expect(SendAlternateNoticeService.default).not.toHaveBeenCalled()
      })

      it('only updates the main notice', async () => {
        await SendNoticeService(notice, notifications)

        expect(UpdateNoticeService.default).toHaveBeenCalledOnce()
        expect(UpdateNoticeService.default.mock.calls[0][0]).toEqual([notice.id])
      })

      it('logs the time taken', async () => {
        await SendNoticeService(notice, notifications)

        const args = notifierStub.omg.mock.calls[0]

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

      vi.spyOn(SendAlternateNoticeService, 'default').mockRejectedValue(
        Object.assign(new Error(), { name: 'Computer says no' })
      )
    })

    it('logs the error', async () => {
      await SendNoticeService(notice, notifications)

      const args = notifierStub.omfg.mock.calls[0]

      expect(args[0]).toEqual('Send notice failed')
      expect(args[1].notice.id).toEqual(notice.id)
      expect(args[2]).toBeInstanceOf(Error)
      expect(args[2].name).toEqual('Computer says no')
    })
  })
})
