// Test framework dependencies

// Test helpers
import * as NoticesFixture from '../../../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'

// Things we need to stub
import CreateAlternateRenewalNoticeService from '../../../../../app/services/notices/setup/create-alternate-renewal-notice.service.js'
import FetchFailedRenewalInvitationsService from '../../../../../app/services/notices/setup/renewal-notice/fetch-failed-renewal-invitations.service.js'

// Thing under test
import RenewalInvitationAlternateNoticeService from '../../../../../app/services/notices/setup/send/renewal-invitation-alternate-notice.service.js'

describe('Notices - Setup - Send - Renewal Invitation Alternate Notice service', () => {
  let alternateNotice
  let alternateNotification
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

    vi.mock('../../../../../app/services/notices/setup/create-alternate-renewal-notice.service.js')
    CreateAlternateRenewalNoticeService.mockResolvedValue({
      notice: alternateNotice,
      notifications: [alternateNotification]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the main notice has failed primary user email notifications', () => {
    beforeEach(() => {
      vi.mock('../../../../../app/services/notices/setup/renewal-notice/fetch-failed-renewal-invitations.service.js')
      FetchFailedRenewalInvitationsService.mockResolvedValue({
        licenceRefs: failedNotification.licences,
        notificationIds: [failedNotification.id]
      })
    })

    it('creates the alternate notice and notifications', async () => {
      await RenewalInvitationAlternateNoticeService(mainNotice)

      const expiryDate = new Date(mainNotice.metadata.expiryDate)
      const renewalDate = new Date(mainNotice.metadata.renewalDate)

      expect(CreateAlternateRenewalNoticeService).toHaveBeenCalledOnce()
      expect(CreateAlternateRenewalNoticeService.mock.calls[0]).toEqual([
        mainNotice,
        failedNotification.licences,
        expiryDate,
        renewalDate
      ])
    })

    it('returns the notice, notification IDs, and notifications', async () => {
      const result = await RenewalInvitationAlternateNoticeService(mainNotice)

      expect(result).toEqual({
        notice: alternateNotice,
        notificationIds: [failedNotification.id],
        notifications: [alternateNotification]
      })
    })
  })

  describe('when the main notice has no failed primary user email notifications', () => {
    beforeEach(() => {
      vi.mock('../../../../../app/services/notices/setup/renewal-notice/fetch-failed-renewal-invitations.service.js')
      FetchFailedRenewalInvitationsService.mockResolvedValue({
        licenceRefs: [],
        notificationIds: []
      })
    })

    it('does not create the alternate notice', async () => {
      await RenewalInvitationAlternateNoticeService(mainNotice)

      expect(CreateAlternateRenewalNoticeService).not.toHaveBeenCalled()
    })

    it('returns null', async () => {
      const result = await RenewalInvitationAlternateNoticeService(mainNotice)

      expect(result).toBeNull()
    })
  })
})
