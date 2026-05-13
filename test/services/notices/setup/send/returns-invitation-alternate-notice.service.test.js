'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../../support/fixtures/notifications.fixture.js')

// Things we need to stub
const CreateAlternateNoticeService = require('../../../../../app/services/notices/setup/create-alternate-notice.service.js')
const FetchFailedReturnsInvitationsService = require('../../../../../app/services/notices/setup/returns-notice/fetch-failed-returns-invitations.service.js')

// Thing under test
const ReturnsInvitationAlternateNoticeService = require('../../../../../app/services/notices/setup/send/returns-invitation-alternate-notice.service.js')

describe('Notices - Setup - Send - Returns Invitation Alternate Notice service', () => {
  let alternateNotice
  let alternateNotification
  let createAlternateNoticeStub
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

    createAlternateNoticeStub = Sinon.stub(CreateAlternateNoticeService, 'go').resolves({
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
      await ReturnsInvitationAlternateNoticeService.go(mainNotice)

      expect(createAlternateNoticeStub.calledOnce).to.be.true()
      expect(createAlternateNoticeStub.firstCall.args).to.equal([
        mainNotice,
        failedNotification.dueDate,
        failedNotification.licences,
        failedNotification.returnLogIds
      ])
    })

    it('returns the notice, notification IDs, and notifications', async () => {
      const result = await ReturnsInvitationAlternateNoticeService.go(mainNotice)

      expect(result).to.equal({
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
      await ReturnsInvitationAlternateNoticeService.go(mainNotice)

      expect(createAlternateNoticeStub.called).to.be.false()
    })

    it('returns null', async () => {
      const result = await ReturnsInvitationAlternateNoticeService.go(mainNotice)

      expect(result).to.be.null()
    })
  })
})
