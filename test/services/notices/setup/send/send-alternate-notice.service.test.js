'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../fixtures/notifications.fixture.js')

// Things we need to stub
const CreateAlternateNoticeService = require('../../../../../app/services/notices/setup/create-alternate-notice.service.js')
const FetchFailedReturnsInvitationsService = require('../../../../../app/services/notices/setup/returns-notice/fetch-failed-returns-invitations.service.js')
const NotificationModel = require('../../../../../app/models/notification.model.js')
const SendLetterNotificationService = require('../../../../../app/services/notices/setup/send/send-letter-notification.service.js')
const UpdateNoticeService = require('../../../../../app/services/notices/update-notice.service.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

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
  let createAlternateNoticeStub
  let failedNotification
  let mainNotice
  let notificationPatchStub
  let sendLetterNotificationStub
  let updateEventServiceStub

  beforeEach(() => {
    mainNotice = NoticesFixture.returnsInvitation()

    failedNotification = NotificationsFixture.returnsInvitationEmail(mainNotice)
    failedNotification.id = generateUUID()
    failedNotification.status = 'error'

    alternateNotice = NoticesFixture.returnsInvitation()
    alternateNotice.licences = mainNotice.licences
    alternateNotice.triggerNoticeId = mainNotice.id

    alternateNotification = NotificationsFixture.returnsInvitationLetter(alternateNotice)

    createAlternateNoticeStub = Sinon.stub(CreateAlternateNoticeService, 'go').resolves({
      notice: alternateNotice,
      notifications: [alternateNotification]
    })

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

    updateEventServiceStub = Sinon.stub(UpdateNoticeService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the main notice has failed primary user email notifications', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedReturnsInvitationsService, 'go').resolves({
        dueDate: failedNotification.dueDate,
        licenceRefs: failedNotification.licences,
        notificationIds: [failedNotification.id],
        returnLogIds: failedNotification.returnLogIds
      })
    })

    it('creates the alternate notice and notifications', async () => {
      await SendAlternateNoticeService.go(mainNotice)

      expect(createAlternateNoticeStub.calledOnce).to.be.true()
      expect(createAlternateNoticeStub.firstCall.args).to.equal([
        mainNotice,
        failedNotification.dueDate,
        failedNotification.licences,
        failedNotification.returnLogIds
      ])
    })

    it('sends the alternate notifications to Notify and records the results', async () => {
      await SendAlternateNoticeService.go(mainNotice)

      expect(sendLetterNotificationStub.calledOnce).to.be.true()
      expect(sendLetterNotificationStub.firstCall.args).to.equal([alternateNotification, alternateNotice.referenceCode])

      // The first call is the recording the result. The second is updating the failed notifications with the alternate
      // notice ID (tested elsewhere)
      expect(notificationPatchStub.calledTwice).to.be.true()
      expect(notificationPatchStub.firstCall.args).to.equal([
        {
          plaintext: letterPlaintext,
          notifyError: undefined,
          notifyId: '8af52d9f-e4ab-4c04-a49a-731439a8697e',
          notifyStatus: 'created',
          status: 'pending'
        }
      ])
    })

    it('updates the failed notifications with the alternate notice ID', async () => {
      await SendAlternateNoticeService.go(mainNotice)

      expect(notificationPatchStub.calledTwice).to.be.true()
      expect(notificationPatchStub.secondCall.args[0]).to.equal(
        { alternateNoticeId: alternateNotice.id },
        { skip: ['updatedAt'] }
      )
    })

    it('returns the sent alternate notice', async () => {
      const result = await SendAlternateNoticeService.go(mainNotice)

      expect(result).to.equal(alternateNotice)
    })
  })

  describe('when the main notice has NO failed primary user email notifications', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedReturnsInvitationsService, 'go').resolves({
        licenceRefs: [],
        notificationIds: [],
        returnLogIds: []
      })
    })

    it('does not proceed with the alternate notice', async () => {
      await SendAlternateNoticeService.go(mainNotice)

      expect(createAlternateNoticeStub.called).to.be.false()
      expect(sendLetterNotificationStub.called).to.be.false()
      expect(updateEventServiceStub.called).to.be.false()
    })

    it('returns null', async () => {
      const result = await SendAlternateNoticeService.go(mainNotice)

      expect(result).to.be.null()
    })
  })
})
