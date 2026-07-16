// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateLicenceRef } from '../../../support/generators.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Things we need to stub
import * as CreateNoticeService from '../../../../app/services/notices/setup/create-notice.service.js'
import * as CreateNotificationsService from '../../../../app/services/notices/setup/create-notifications.service.js'
import * as FetchRenewalRecipients from '../../../../app/services/jobs/renewal-invitations/fetch-renewal-recipients.service.js'
import * as SendNoticeService from '../../../../app/services/notices/setup/send/send-notice.service.js'
import NotifyConfig from '../../../../config/notify.config.js'

// Thing under test
import SendRenewalInvitations from '../../../../app/services/jobs/renewal-invitations/send-renewal-invitations.service.js'

describe('Jobs - Renewal Invitations - Send Renewal Invitations service', () => {
  const days = '300'
  const recipients = [{ licence_refs: generateLicenceRef() }]

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

    vi.useFakeTimers({ now: todayDate })

    vi.replaceProperty(NotifyConfig, 'replyTo', 'notify@test.gov.uk')

    vi.spyOn(FetchRenewalRecipients, 'default').mockResolvedValue(recipients)
    vi.spyOn(CreateNoticeService, 'default').mockResolvedValue({ id: noticeId })
    vi.spyOn(CreateNotificationsService, 'default').mockResolvedValue(notifications)
    vi.spyOn(SendNoticeService, 'default').mockResolvedValue()
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

      const [firstArg, secondArg, thirdArg] = CreateNoticeService.default.mock.calls[0]

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

      const [firstArg, secondArg, thirdArg] = CreateNotificationsService.default.mock.calls[0]

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

      const [firstArg, secondArg] = SendNoticeService.default.mock.calls[0]

      // Argument 1: The notice
      expect(firstArg).toMatchObject({ id: noticeId })

      // Argument 2: The notifications
      expect(secondArg).toEqual(notifications)
    })
  })

  describe('when there are no renewal invitations to send', () => {
    beforeEach(() => {
      vi.spyOn(FetchRenewalRecipients, 'default').mockResolvedValue([])
    })

    it('returns the empty recipients', async () => {
      const result = await SendRenewalInvitations(days)

      expect(result).toEqual([])
    })

    it('does not call the services', async () => {
      await SendRenewalInvitations(days)

      expect(CreateNoticeService.default).not.toHaveBeenCalled()
      expect(CreateNotificationsService.default).not.toHaveBeenCalled()
      expect(SendNoticeService.default).not.toHaveBeenCalled()
    })
  })
})
