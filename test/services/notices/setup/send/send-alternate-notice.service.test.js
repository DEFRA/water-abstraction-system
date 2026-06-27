'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NoticesFixture = require('../../../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Things we need to stub
const NotificationModel = require('../../../../../app/models/notification.model.js')
const RenewalInvitationAlternateNoticeService = require('../../../../../app/services/notices/setup/send/renewal-invitation-alternate-notice.service.js')
const ReturnsInvitationAlternateNoticeService = require('../../../../../app/services/notices/setup/send/returns-invitation-alternate-notice.service.js')
const SendLetterNotificationService = require('../../../../../app/services/notices/setup/send/send-letter-notification.service.js')

// Thing under test
const SendAlternateNoticeService = require('../../../../../app/services/notices/setup/send/send-alternate-notice.service.js')

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
  let sendLetterNotificationStub

  beforeEach(() => {
    mainNotice = NoticesFixture.returnsInvitation()
    failedNotificationId = generateUUID()

    alternateNotice = NoticesFixture.returnsInvitation()
    alternateNotice.licences = mainNotice.licences
    alternateNotice.triggerNoticeId = mainNotice.id

    alternateNotification = NotificationsFixture.returnsInvitationLetter(alternateNotice)

    sendLetterNotificationStub = Sinon.stub(SendLetterNotificationService, 'go').resolves({
      id: alternateNotification.id,
      notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
      notifyStatus: 'created',
      plaintext: letterPlaintext,
      status: 'pending'
    })

    notificationPatchStub = Sinon.stub().returnsThis()
    Sinon.stub(NotificationModel, 'query').returns({
      findById: Sinon.stub().returnsThis(),
      patch: notificationPatchStub,
      whereIn: Sinon.stub().returnsThis(),
      whereNull: Sinon.stub().returnsThis()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the main notice has failed primary user email notifications', () => {
    beforeEach(() => {
      Sinon.stub(ReturnsInvitationAlternateNoticeService, 'go').resolves({
        notice: alternateNotice,
        notificationIds: [failedNotificationId],
        notifications: [alternateNotification]
      })
    })

    it('sends the alternate notifications to Notify and records the results', async () => {
      await SendAlternateNoticeService.go(mainNotice)

      expect(sendLetterNotificationStub.calledOnce).toBe(true)
      expect(sendLetterNotificationStub.firstCall.args).toEqual([alternateNotification, alternateNotice.referenceCode])

      // The first call is recording the result. The second is updating the failed notifications with the alternate
      // notice ID (tested elsewhere)
      expect(notificationPatchStub.calledTwice).toBe(true)
      expect(notificationPatchStub.firstCall.args[0]).toEqual({
        notifyError: undefined,
        notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
        notifyStatus: 'created',
        plaintext: letterPlaintext,
        status: 'pending'
      })
    })

    it('updates the failed notifications with the alternate notice ID', async () => {
      await SendAlternateNoticeService.go(mainNotice)

      expect(notificationPatchStub.calledTwice).toBe(true)
      expect(notificationPatchStub.secondCall.args[0]).toMatchObject({ alternateNoticeId: alternateNotice.id })
    })

    it('returns the sent alternate notice', async () => {
      const result = await SendAlternateNoticeService.go(mainNotice)

      expect(result).toEqual(alternateNotice)
    })
  })

  describe('when the main notice has no failed primary user email notifications', () => {
    beforeEach(() => {
      Sinon.stub(ReturnsInvitationAlternateNoticeService, 'go').resolves(null)
    })

    it('does not proceed with sending', async () => {
      await SendAlternateNoticeService.go(mainNotice)

      expect(sendLetterNotificationStub.called).toBe(false)
    })

    it('returns null', async () => {
      const result = await SendAlternateNoticeService.go(mainNotice)

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

      Sinon.stub(RenewalInvitationAlternateNoticeService, 'go').resolves({
        notice: alternateNotice,
        notificationIds: [failedNotificationId],
        notifications: [alternateNotification]
      })
    })

    it('delegates to RenewalInvitationAlternateNoticeService', async () => {
      await SendAlternateNoticeService.go(mainNotice)

      expect(RenewalInvitationAlternateNoticeService.go.calledOnce).toBe(true)
    })

    it('returns the sent alternate notice', async () => {
      const result = await SendAlternateNoticeService.go(mainNotice)

      expect(result).toEqual(alternateNotice)
    })
  })
})
