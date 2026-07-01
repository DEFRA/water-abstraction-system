'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NoticesFixture = require('../../../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../support/fixtures/notifications.fixture.js')

// Things we need to stub
const CreateAlternateRenewalNoticeService = require('../../../../../app/services/notices/setup/create-alternate-renewal-notice.service.js')
const FetchFailedRenewalInvitationsService = require('../../../../../app/services/notices/setup/renewal-notice/fetch-failed-renewal-invitations.service.js')

// Thing under test
const RenewalInvitationAlternateNoticeService = require('../../../../../app/services/notices/setup/send/renewal-invitation-alternate-notice.service.js')

describe('Notices - Setup - Send - Renewal Invitation Alternate Notice service', () => {
  let alternateNotice
  let alternateNotification
  let createAlternateRenewalNoticeStub
  let failedNotification
  let mainNotice

  beforeEach(() => {
    mainNotice = NoticesFixture.renewalInvitation()

    failedNotification = NotificationsFixture.renewalInvitationEmail(mainNotice)
    failedNotification.status = 'error'

    alternateNotice = NoticesFixture.renewalInvitation()
    alternateNotice.licences = mainNotice.licences
    alternateNotice.triggerNoticeId = mainNotice.id

    alternateNotification = NotificationsFixture.renewalInvitationLetter(alternateNotice)

    createAlternateRenewalNoticeStub = Sinon.stub(CreateAlternateRenewalNoticeService, 'go').resolves({
      notice: alternateNotice,
      notifications: [alternateNotification]
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the main notice has failed primary user email notifications', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedRenewalInvitationsService, 'go').resolves({
        licenceRefs: failedNotification.licences,
        notificationIds: [failedNotification.id]
      })
    })

    it('creates the alternate notice and notifications', async () => {
      await RenewalInvitationAlternateNoticeService.go(mainNotice)

      const expiryDate = new Date(mainNotice.metadata.expiryDate)
      const renewalDate = new Date(mainNotice.metadata.renewalDate)

      expect(createAlternateRenewalNoticeStub.calledOnce).toBe(true)
      expect(createAlternateRenewalNoticeStub.firstCall.args).toEqual([
        mainNotice,
        failedNotification.licences,
        expiryDate,
        renewalDate
      ])
    })

    it('returns the notice, notification IDs, and notifications', async () => {
      const result = await RenewalInvitationAlternateNoticeService.go(mainNotice)

      expect(result).toEqual({
        notice: alternateNotice,
        notificationIds: [failedNotification.id],
        notifications: [alternateNotification]
      })
    })
  })

  describe('when the main notice has no failed primary user email notifications', () => {
    beforeEach(() => {
      Sinon.stub(FetchFailedRenewalInvitationsService, 'go').resolves({
        licenceRefs: [],
        notificationIds: []
      })
    })

    it('does not create the alternate notice', async () => {
      await RenewalInvitationAlternateNoticeService.go(mainNotice)

      expect(createAlternateRenewalNoticeStub.called).toBe(false)
    })

    it('returns null', async () => {
      const result = await RenewalInvitationAlternateNoticeService.go(mainNotice)

      expect(result).toBeNull()
    })
  })
})
