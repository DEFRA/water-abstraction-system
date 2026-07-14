// Test helpers
import * as NoticesFixture from '../../../../support/fixtures/notices.fixture.js'
import * as NotificationsFixture from '../../../../support/fixtures/notifications.fixture.js'

// Things we need to stub
import * as CreateAlternateReturnsNoticeService from '../../../../../app/services/notices/setup/create-alternate-returns-notice.service.js'
import * as FetchFailedReturnsInvitationsService from '../../../../../app/services/notices/setup/returns-notice/fetch-failed-returns-invitations.service.js'

// Thing under test
import ReturnsInvitationAlternateNoticeService from '../../../../../app/services/notices/setup/send/returns-invitation-alternate-notice.service.js'

describe('Notices - Setup - Send - Returns Invitation Alternate Notice service', () => {
  let alternateNotice
  let alternateNotification
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

    vi.spyOn(CreateAlternateReturnsNoticeService, 'default').mockResolvedValue({
      notice: alternateNotice,
      notifications: [alternateNotification]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the main notice has failed primary user email notifications', () => {
    beforeEach(() => {
      vi.spyOn(FetchFailedReturnsInvitationsService, 'default').mockResolvedValue({
        dueDate: failedNotification.dueDate,
        licenceRefs: failedNotification.licences,
        notificationIds: [failedNotification.id],
        returnLogIds: failedNotification.returnLogIds
      })
    })

    it('creates the alternate notice and notifications', async () => {
      await ReturnsInvitationAlternateNoticeService(mainNotice)

      expect(CreateAlternateReturnsNoticeService.default).toHaveBeenCalledOnce()
      expect(CreateAlternateReturnsNoticeService.default.mock.calls[0]).toEqual([
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
      vi.spyOn(FetchFailedReturnsInvitationsService, 'default').mockResolvedValue({
        licenceRefs: [],
        notificationIds: [],
        returnLogIds: []
      })
    })

    it('does not create the alternate notice', async () => {
      await ReturnsInvitationAlternateNoticeService(mainNotice)

      expect(CreateAlternateReturnsNoticeService.default).not.toHaveBeenCalled()
    })

    it('returns null', async () => {
      const result = await ReturnsInvitationAlternateNoticeService(mainNotice)

      expect(result).toBeNull()
    })
  })
})
