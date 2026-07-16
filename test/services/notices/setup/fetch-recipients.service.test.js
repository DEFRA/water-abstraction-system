// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import { NoticeJourney, NoticeType } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import * as FetchAbstractionAlertRecipientsDal from '../../../../app/dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js'
import * as FetchPaperReturnsRecipientsService from '../../../../app/services/notices/setup/returns-notice/fetch-paper-returns-recipients.service.js'
import * as FetchRenewalInvitationRecipientsService from '../../../../app/services/notices/setup/renewal-notice/fetch-renewal-invitation-recipients.service.js'
import * as FetchReturnsInvitationRecipientsService from '../../../../app/services/notices/setup/returns-notice/fetch-returns-invitation-recipients.service.js'
import * as FetchReturnsReminderRecipientsService from '../../../../app/services/notices/setup/returns-notice/fetch-returns-reminder-recipients.service.js'

// Thing under test
import FetchRecipientsService from '../../../../app/services/notices/setup/fetch-recipients.service.js'

describe('Notices - Setup - Fetch Recipients service', () => {
  let download
  let recipients
  let session

  beforeEach(() => {
    vi.spyOn(FetchAbstractionAlertRecipientsDal, 'default').mockResolvedValue()
    vi.spyOn(FetchPaperReturnsRecipientsService, 'default').mockResolvedValue()
    vi.spyOn(FetchRenewalInvitationRecipientsService, 'default').mockResolvedValue()
    vi.spyOn(FetchReturnsInvitationRecipientsService, 'default').mockResolvedValue()
    vi.spyOn(FetchReturnsReminderRecipientsService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

        vi.spyOn(FetchAbstractionAlertRecipientsDal, 'default').mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchAbstractionAlertRecipientsDal.default).toHaveBeenCalledExactlyOnceWith(session)

        expect(FetchReturnsInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService.default).not.toHaveBeenCalled()

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

        vi.spyOn(FetchPaperReturnsRecipientsService, 'default').mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchPaperReturnsRecipientsService.default).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal.default).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService.default).not.toHaveBeenCalled()

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

        vi.spyOn(FetchPaperReturnsRecipientsService, 'default').mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchPaperReturnsRecipientsService.default).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal.default).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService.default).not.toHaveBeenCalled()

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

        vi.spyOn(FetchRenewalInvitationRecipientsService, 'default').mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchRenewalInvitationRecipientsService.default).toHaveBeenCalledExactlyOnceWith(session)

        expect(FetchAbstractionAlertRecipientsDal.default).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService.default).not.toHaveBeenCalled()

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

        vi.spyOn(FetchReturnsInvitationRecipientsService, 'default').mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchReturnsInvitationRecipientsService.default).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal.default).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService.default).not.toHaveBeenCalled()

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

        vi.spyOn(FetchReturnsInvitationRecipientsService, 'default').mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchReturnsInvitationRecipientsService.default).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal.default).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService.default).not.toHaveBeenCalled()

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

        vi.spyOn(FetchReturnsReminderRecipientsService, 'default').mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchReturnsReminderRecipientsService.default).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal.default).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService.default).not.toHaveBeenCalled()

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

        vi.spyOn(FetchReturnsReminderRecipientsService, 'default').mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchReturnsReminderRecipientsService.default).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal.default).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService.default).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService.default).not.toHaveBeenCalled()

        expect(results).toEqual(recipients)
      })
    })
  })
})
