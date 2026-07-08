// Test framework dependencies

// Test helpers
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import { NoticeJourney, NoticeType } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import FetchAbstractionAlertRecipientsDal from '../../../../app/dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js'
import FetchPaperReturnsRecipientsService from '../../../../app/services/notices/setup/returns-notice/fetch-paper-returns-recipients.service.js'
import FetchRenewalInvitationRecipientsService from '../../../../app/services/notices/setup/renewal-notice/fetch-renewal-invitation-recipients.service.js'
import FetchReturnsInvitationRecipientsService from '../../../../app/services/notices/setup/returns-notice/fetch-returns-invitation-recipients.service.js'
import FetchReturnsReminderRecipientsService from '../../../../app/services/notices/setup/returns-notice/fetch-returns-reminder-recipients.service.js'

// Thing under test
import FetchRecipientsService from '../../../../app/services/notices/setup/fetch-recipients.service.js'

describe('Notices - Setup - Fetch Recipients service', () => {
  let download
  let recipients
  let session

  beforeEach(() => {
    vi.mock('../../../../app/dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js')
    FetchAbstractionAlertRecipientsDal.mockResolvedValue()
    vi.mock('../../../../app/services/notices/setup/returns-notice/fetch-paper-returns-recipients.service.js')
    FetchPaperReturnsRecipientsService.mockResolvedValue()
    vi.mock('../../../../app/services/notices/setup/renewal-notice/fetch-renewal-invitation-recipients.service.js')
    FetchRenewalInvitationRecipientsService.mockResolvedValue()
    vi.mock('../../../../app/services/notices/setup/returns-notice/fetch-returns-invitation-recipients.service.js')
    FetchReturnsInvitationRecipientsService.mockResolvedValue()
    vi.mock('../../../../app/services/notices/setup/returns-notice/fetch-returns-reminder-recipients.service.js')
    FetchReturnsReminderRecipientsService.mockResolvedValue()
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

        FetchAbstractionAlertRecipientsDal.mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchAbstractionAlertRecipientsDal).toHaveBeenCalledExactlyOnceWith(session)

        expect(FetchReturnsInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService).not.toHaveBeenCalled()

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

        FetchPaperReturnsRecipientsService.mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchPaperReturnsRecipientsService).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService).not.toHaveBeenCalled()

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

        FetchPaperReturnsRecipientsService.mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchPaperReturnsRecipientsService).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService).not.toHaveBeenCalled()

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

        FetchRenewalInvitationRecipientsService.mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchRenewalInvitationRecipientsService).toHaveBeenCalledExactlyOnceWith(session)

        expect(FetchAbstractionAlertRecipientsDal).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService).not.toHaveBeenCalled()

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

        FetchReturnsInvitationRecipientsService.mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchReturnsInvitationRecipientsService).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService).not.toHaveBeenCalled()

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

        FetchReturnsInvitationRecipientsService.mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchReturnsInvitationRecipientsService).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsReminderRecipientsService).not.toHaveBeenCalled()

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

        FetchReturnsReminderRecipientsService.mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchReturnsReminderRecipientsService).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService).not.toHaveBeenCalled()

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

        FetchReturnsReminderRecipientsService.mockResolvedValue(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService(session, download)

        expect(FetchReturnsReminderRecipientsService).toHaveBeenCalledExactlyOnceWith(session, download)

        expect(FetchAbstractionAlertRecipientsDal).not.toHaveBeenCalled()
        expect(FetchPaperReturnsRecipientsService).not.toHaveBeenCalled()
        expect(FetchRenewalInvitationRecipientsService).not.toHaveBeenCalled()
        expect(FetchReturnsInvitationRecipientsService).not.toHaveBeenCalled()

        expect(results).toEqual(recipients)
      })
    })
  })
})
