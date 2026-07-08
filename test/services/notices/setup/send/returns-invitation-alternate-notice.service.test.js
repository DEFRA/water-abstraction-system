'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NoticesFixture = require('../../../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../support/fixtures/notifications.fixture.js')

// Things we need to stub
const CreateAlternateReturnsNoticeService = require('../../../../../app/services/notices/setup/create-alternate-returns-notice.service.js')
const FetchFailedReturnsInvitationsService = require('../../../../../app/services/notices/setup/returns-notice/fetch-failed-returns-invitations.service.js')

// Thing under test
const ReturnsInvitationAlternateNoticeService = require('../../../../../app/services/notices/setup/send/returns-invitation-alternate-notice.service.js')

describe('Notices - Setup - Send - Returns Invitation Alternate Notice service', () => {
  let alternateNotice
  let alternateNotification
  let createAlternateReturnsNoticeStub
  let failedNotification
  let mainNotice

  beforeEach(() => {
    mainNotice = NoticesFixture.returnsInvitation()

    failedNotification = NotificationsFixture.returnsInvitationEmail(mainNotice)
    failedNotification.status = 'error'

    alternateNotice = NoticesFixture.returnsInvitation()
    alternateNotice.licences = mainNotice.licences
    alternateNotice.triggerNoticeId = mainNotice.id

    alternateNotification = NotificationsFixture.returnsInvitationLetter(alternateNotice)

    createAlternateReturnsNoticeStub = Sinon.stub(CreateAlternateReturnsNoticeService, 'go').resolves({
      notice: alternateNotice,
      notifications: [alternateNotification]
    })
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
      await ReturnsInvitationAlternateNoticeService(mainNotice)

      expect(createAlternateReturnsNoticeStub.calledOnce).toBe(true)
      expect(createAlternateReturnsNoticeStub.firstCall.args).toEqual([
        mainNotice,
        failedNotification.licences,
        failedNotification.dueDate,
        failedNotification.returnLogIds
      ])
    })

    it('returns the notice, notification IDs, and notifications', async () => {
      const result = await ReturnsInvitationAlternateNoticeService(mainNotice)

      expect(result).toEqual({
        notice: alternateNotice,
        notificationIds: [failedNotification.id],
        notifications: [alternateNotification]
      })
    })
  })

  describe('when the main notice has no failed primary user email notifications', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedReturnsInvitationsService, 'go').resolves({
        licenceRefs: [],
        notificationIds: [],
        returnLogIds: []
      })
    })

    it('does not create the alternate notice', async () => {
      await ReturnsInvitationAlternateNoticeService(mainNotice)

      expect(createAlternateReturnsNoticeStub.called).toBe(false)
    })

    it('returns null', async () => {
      const result = await ReturnsInvitationAlternateNoticeService(mainNotice)

      expect(result).toBeNull()
    })
  })
})
