// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as NoticesFixture from '../../../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'
import { generateUUID } from '../../../../../app/lib/general.lib.js'

// Things we need to stub
import * as RenewalInvitationAlternateNoticeService from '../../../../../app/services/notices/setup/send/renewal-invitation-alternate-notice.service.js'
import * as ReturnsInvitationAlternateNoticeService from '../../../../../app/services/notices/setup/send/returns-invitation-alternate-notice.service.js'
import * as SendLetterNotificationService from '../../../../../app/services/notices/setup/send/send-letter-notification.service.js'
import NotificationModel from '../../../../../app/models/notification.model.js'

// Thing under test
import SendAlternateNoticeService from '../../../../../app/services/notices/setup/send/send-alternate-notice.service.js'

describe('Notices - Setup - Send - Send Alternate Notice service', () => {
  const letterPlaintext =
    'Dear ACME Services Ltd,\r\n' +
    '\r\n' +
    '^ You must submit a record of your water abstraction. \r\n' +
    '\r\n' +
    '^ You’ll need to submit your returns by  2 December 2025.\r\n'

  let alternateNotice
  let alternateNotification
  let failedNotificationId
  let mainNotice
  let notificationPatchStub
  beforeEach(() => {
    mainNotice = NoticesFixture.returnsInvitation()
    failedNotificationId = generateUUID()

    alternateNotice = NoticesFixture.returnsInvitation()
    alternateNotice.licences = mainNotice.licences
    alternateNotice.triggerNoticeId = mainNotice.id

    alternateNotification = NotificationsFixture.returnsInvitationLetter(alternateNotice)

    vi.spyOn(SendLetterNotificationService, 'default').mockResolvedValue({
      id: alternateNotification.id,
      notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
      notifyStatus: 'created',
      plaintext: letterPlaintext,
      status: 'pending'
    })

    notificationPatchStub = vi.fn().mockReturnThis()
    vi.spyOn(NotificationModel, 'query').mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      patch: notificationPatchStub,
      whereIn: vi.fn().mockReturnThis(),
      whereNull: vi.fn().mockReturnThis()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the main notice has failed primary user email notifications', () => {
    beforeEach(() => {
      vi.spyOn(ReturnsInvitationAlternateNoticeService, 'default').mockResolvedValue({
        notice: alternateNotice,
        notificationIds: [failedNotificationId],
        notifications: [alternateNotification]
      })
    })

    it('sends the alternate notifications to Notify and records the results', async () => {
      await SendAlternateNoticeService(mainNotice)

      expect(SendLetterNotificationService.default).toHaveBeenCalledOnce()
      expect(SendLetterNotificationService.default.mock.calls[0]).toEqual([
        alternateNotification,
        alternateNotice.referenceCode
      ])

      // The first call is recording the result. The second is updating the failed notifications with the alternate
      // notice ID (tested elsewhere)
      expect(notificationPatchStub).toHaveBeenCalledTimes(2)
      expect(notificationPatchStub.mock.calls[0][0]).toEqual({
        notifyError: undefined,
        notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
        notifyStatus: 'created',
        plaintext: letterPlaintext,
        status: 'pending'
      })
    })

    it('updates the failed notifications with the alternate notice ID', async () => {
      await SendAlternateNoticeService(mainNotice)

      expect(notificationPatchStub).toHaveBeenCalledTimes(2)
      expect(notificationPatchStub.mock.calls[1][0]).toMatchObject({ alternateNoticeId: alternateNotice.id })
    })

    it('returns the sent alternate notice', async () => {
      const result = await SendAlternateNoticeService(mainNotice)

      expect(result).toEqual(alternateNotice)
    })
  })

  describe('when the main notice has no failed primary user email notifications', () => {
    beforeEach(() => {
      vi.spyOn(ReturnsInvitationAlternateNoticeService, 'default').mockResolvedValue(null)
    })

    it('does not proceed with sending', async () => {
      await SendAlternateNoticeService(mainNotice)

      expect(SendLetterNotificationService.default).not.toHaveBeenCalled()
    })

    it('returns null', async () => {
      const result = await SendAlternateNoticeService(mainNotice)

      expect(result).toBeNull()
    })
  })

  describe('when the main notice is a renewal invitation with failed primary user email notifications', () => {
    beforeEach(() => {
      mainNotice = NoticesFixture.renewalInvitation()

      alternateNotice = NoticesFixture.renewalInvitation()
      alternateNotice.licences = mainNotice.licences
      alternateNotice.triggerNoticeId = mainNotice.id

      alternateNotification = NotificationsFixture.renewalInvitationLetter(alternateNotice)

      vi.spyOn(RenewalInvitationAlternateNoticeService, 'default').mockResolvedValue({
        notice: alternateNotice,
        notificationIds: [failedNotificationId],
        notifications: [alternateNotification]
      })
    })

    it('delegates to RenewalInvitationAlternateNoticeService', async () => {
      await SendAlternateNoticeService(mainNotice)

      expect(RenewalInvitationAlternateNoticeService.default).toHaveBeenCalledOnce()
    })

    it('returns the sent alternate notice', async () => {
      const result = await SendAlternateNoticeService(mainNotice)

      expect(result).toEqual(alternateNotice)
    })
  })
})
