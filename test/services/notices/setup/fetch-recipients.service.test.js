'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixture.js')
const { NoticeJourney, NoticeType } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const FetchAbstractionAlertRecipientsDal = require('../../../../app/dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js')
const FetchPaperReturnsRecipientsService = require('../../../../app/services/notices/setup/returns-notice/fetch-paper-returns-recipients.service.js')
const FetchRenewalInvitationRecipientsService = require('../../../../app/services/notices/setup/renewal-notice/fetch-renewal-invitation-recipients.service.js')
const FetchReturnsInvitationRecipientsService = require('../../../../app/services/notices/setup/returns-notice/fetch-returns-invitation-recipients.service.js')
const FetchReturnsReminderRecipientsService = require('../../../../app/services/notices/setup/returns-notice/fetch-returns-reminder-recipients.service.js')

// Thing under test
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')

describe('Notices - Setup - Fetch Recipients service', () => {
  let download
  let fetchAbstractionAlertRecipientsStub
  let fetchPaperReturnsRecipientsStub
  let fetchRenewalInvitationRecipientsStub
  let fetchReturnsInvitationRecipientsStub
  let fetchReturnsReminderRecipientsStub
  let recipients
  let session

  beforeEach(() => {
    fetchAbstractionAlertRecipientsStub = Sinon.stub(FetchAbstractionAlertRecipientsDal, 'go').resolves()
    fetchPaperReturnsRecipientsStub = Sinon.stub(FetchPaperReturnsRecipientsService, 'go').resolves()
    fetchRenewalInvitationRecipientsStub = Sinon.stub(FetchRenewalInvitationRecipientsService, 'go').resolves()
    fetchReturnsInvitationRecipientsStub = Sinon.stub(FetchReturnsInvitationRecipientsService, 'go').resolves()
    fetchReturnsReminderRecipientsStub = Sinon.stub(FetchReturnsReminderRecipientsService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when setting up an abstraction alert', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.ALERTS,
        noticeType: NoticeType.ABSTRACTION_ALERTS
      }

      download = false
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        recipients = [RecipientsFixture.alertNoticePrimaryUser(), RecipientsFixture.alertNoticeAdditionalContact()]

        fetchAbstractionAlertRecipientsStub.resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchAbstractionAlertRecipientsStub.calledOnceWith(session)).toBe(true)

        expect(fetchReturnsInvitationRecipientsStub.called).toBe(false)
        expect(fetchRenewalInvitationRecipientsStub.called).toBe(false)
        expect(fetchPaperReturnsRecipientsStub.called).toBe(false)
        expect(fetchReturnsReminderRecipientsStub.called).toBe(false)

        expect(results).toEqual(recipients)
      })
    })
  })

  describe('when setting up a paper return', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.ADHOC,
        noticeType: NoticeType.PAPER_RETURN
      }
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        download = false

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchPaperReturnsRecipientsStub.resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchPaperReturnsRecipientsStub.calledOnceWith(session, download)).toBe(true)

        expect(fetchAbstractionAlertRecipientsStub.called).toBe(false)
        expect(fetchRenewalInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsReminderRecipientsStub.called).toBe(false)

        expect(results).toEqual(recipients)
      })
    })

    describe('and fetching recipients for downloading', () => {
      beforeEach(() => {
        download = true

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchPaperReturnsRecipientsStub.resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchPaperReturnsRecipientsStub.calledOnceWith(session, download)).toBe(true)

        expect(fetchAbstractionAlertRecipientsStub.called).toBe(false)
        expect(fetchRenewalInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsReminderRecipientsStub.called).toBe(false)

        expect(results).toEqual(recipients)
      })
    })
  })

  describe('when setting up a renewal invitation', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.ADHOC,
        noticeType: NoticeType.RENEWAL_INVITATIONS
      }

      download = false
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        recipients = [RecipientsFixture.renewalInvitationPrimaryUser()]

        fetchRenewalInvitationRecipientsStub.resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchRenewalInvitationRecipientsStub.calledOnceWith(session)).toBe(true)

        expect(fetchAbstractionAlertRecipientsStub.called).toBe(false)
        expect(fetchPaperReturnsRecipientsStub.called).toBe(false)
        expect(fetchReturnsInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsReminderRecipientsStub.called).toBe(false)

        expect(results).toEqual(recipients)
      })
    })
  })

  describe('when setting up a returns invitation', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.ADHOC,
        noticeType: NoticeType.INVITATIONS
      }
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        download = false

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchReturnsInvitationRecipientsStub.resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchReturnsInvitationRecipientsStub.calledOnceWith(session, download)).toBe(true)

        expect(fetchAbstractionAlertRecipientsStub.called).toBe(false)
        expect(fetchPaperReturnsRecipientsStub.called).toBe(false)
        expect(fetchRenewalInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsReminderRecipientsStub.called).toBe(false)

        expect(results).toEqual(recipients)
      })
    })

    describe('and fetching recipients for downloading', () => {
      beforeEach(() => {
        download = true

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchReturnsInvitationRecipientsStub.resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchReturnsInvitationRecipientsStub.calledOnceWith(session, download)).toBe(true)

        expect(fetchAbstractionAlertRecipientsStub.called).toBe(false)
        expect(fetchPaperReturnsRecipientsStub.called).toBe(false)
        expect(fetchRenewalInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsReminderRecipientsStub.called).toBe(false)

        expect(results).toEqual(recipients)
      })
    })
  })

  describe('when setting up a returns reminder', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.STANDARD,
        noticeType: NoticeType.REMINDERS
      }
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        download = false

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchReturnsReminderRecipientsStub.resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchReturnsReminderRecipientsStub.calledOnceWith(session, download)).toBe(true)

        expect(fetchAbstractionAlertRecipientsStub.called).toBe(false)
        expect(fetchPaperReturnsRecipientsStub.called).toBe(false)
        expect(fetchRenewalInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsInvitationRecipientsStub.called).toBe(false)

        expect(results).toEqual(recipients)
      })
    })

    describe('and fetching recipients for downloading', () => {
      beforeEach(() => {
        download = true

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchReturnsReminderRecipientsStub.resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchReturnsReminderRecipientsStub.calledOnceWith(session, download)).toBe(true)

        expect(fetchAbstractionAlertRecipientsStub.called).toBe(false)
        expect(fetchPaperReturnsRecipientsStub.called).toBe(false)
        expect(fetchRenewalInvitationRecipientsStub.called).toBe(false)
        expect(fetchReturnsInvitationRecipientsStub.called).toBe(false)

        expect(results).toEqual(recipients)
      })
    })
  })
})
