// Test framework dependencies

// Test helpers
import { generateLicenceRef } from '../../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import CreateNoticeService from '../../../../app/services/notices/setup/create-notice.service.js'
import CreateNotificationsService from '../../../../app/services/notices/setup/create-notifications.service.js'
import FetchRenewalRecipients from '../../../../app/services/jobs/renewal-invitations/fetch-renewal-recipients.service.js'
import NotifyConfig from '../../../../config/notify.config.js'
import SendNoticeService from '../../../../app/services/notices/setup/send/send-notice.service.js'

// Thing under test
import SendRenewalInvitations from '../../../../app/services/jobs/renewal-invitations/send-renewal-invitations.service.js'

describe('Jobs - Renewal Invitations - Send Renewal Invitations service', () => {
  const days = '300'
  const recipients = [{ licence_refs: generateLicenceRef() }]

  let clock
  let expectedRenewalDate
  let expiredDate
  let noticeId
  let notifications
  let todayDate

  beforeEach(() => {
    noticeId = generateUUID()
    notifications = [{ id: generateUUID() }]

    todayDate = new Date('2026-04-15')

    // 300 days in the future of the test date
    expiredDate = new Date('2027-02-09')
    // 90 days before the expired date
    expectedRenewalDate = new Date('2026-11-11')

    clock = vi.useFakeTimers({ now: todayDate })

    vi.replaceProperty(NotifyConfig, 'replyTo', 'notify@test.gov.uk')

    vi.mock('../../../../app/services/jobs/renewal-invitations/fetch-renewal-recipients.service.js')
    FetchRenewalRecipients.mockResolvedValue(recipients)
    vi.mock('../../../../app/services/notices/setup/create-notice.service.js')
    CreateNoticeService.mockResolvedValue({ id: noticeId })
    vi.mock('../../../../app/services/notices/setup/create-notifications.service.js')
    CreateNotificationsService.mockResolvedValue(notifications)
    vi.mock('../../../../app/services/notices/setup/send/send-notice.service.js')
    SendNoticeService.mockResolvedValue()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('when there are renewal invitations to send', () => {
    it('returns the recipients', async () => {
      const result = await SendRenewalInvitations(days)

      expect(result).toEqual(recipients)
    })

    it('creates a notice for renewal invitations', async () => {
      await SendRenewalInvitations(days)

      const [firstArg, secondArg, thirdArg] = CreateNoticeService.mock.calls[0]

      // Argument 1: Notice type
      expect(firstArg).toMatchObject({
        name: 'Renewals: invitation',
        noticeType: 'renewalInvitations',
        subType: 'renewalInvitation'
      })

      expect(firstArg.referenceCode).toMatch(/^REIN-/)
      expect(firstArg.expiryDate.getTime()).toEqual(expiredDate.getTime())
      expect(firstArg.renewalDate.getTime()).toEqual(expectedRenewalDate.getTime())

      // Argument 2: The Recipients List
      expect(secondArg).toEqual(recipients)

      // Argument 3: The issuer email
      expect(thirdArg).toEqual('notify@test.gov.uk')
    })

    it('creates the notifications', async () => {
      await SendRenewalInvitations(days)

      const [firstArg, secondArg, thirdArg] = CreateNotificationsService.mock.calls[0]

      // Argument 1: Notice type
      expect(firstArg).toMatchObject({
        name: 'Renewals: invitation',
        noticeType: 'renewalInvitations',
        subType: 'renewalInvitation'
      })

      expect(firstArg.referenceCode).toMatch(/^REIN-/)
      expect(firstArg.expiryDate.getTime()).toEqual(expiredDate.getTime())
      expect(firstArg.renewalDate.getTime()).toEqual(expectedRenewalDate.getTime())

      // Argument 2: The Recipients List
      expect(secondArg).toEqual(recipients)

      // Argument 3: The notice id
      expect(thirdArg).toEqual(noticeId)
    })

    it('sends the notice', async () => {
      await SendRenewalInvitations(days)

      const [firstArg, secondArg] = SendNoticeService.mock.calls[0]

      // Argument 1: The notice
      expect(firstArg).toMatchObject({ id: noticeId })

      // Argument 2: The notifications
      expect(secondArg).toEqual(notifications)
    })
  })

  describe('when there are no renewal invitations to send', () => {
    beforeEach(() => {
      FetchRenewalRecipients.mockResolvedValue([])
    })

    it('returns the empty recipients', async () => {
      const result = await SendRenewalInvitations(days)

      expect(result).toEqual([])
    })

    it('does not call the services', async () => {
      await SendRenewalInvitations(days)

      expect(CreateNoticeService).not.toHaveBeenCalled()
      expect(CreateNotificationsService).not.toHaveBeenCalled()
      expect(SendNoticeService).not.toHaveBeenCalled()
    })
  })
})
