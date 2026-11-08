// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import NotifyConfig from 'water-abstraction-engine/config/notify.config.js'

import * as CreateNoticeService from '../../../../src/services/notices/setup/create-notice.service.js'
import * as CreateNotificationsService from '../../../../src/services/notices/setup/create-notifications.service.js'
import * as FetchRenewalRecipients from '../../../../src/dal/jobs/renewal-notice/fetch-renewal-recipients.dal.js'
import * as SendNoticeService from '../../../../src/services/notices/setup/send/send-notice.service.js'

// Thing under test
import SendRenewalNoticeService from '../../../../src/services/jobs/renewal-notice/send-renewal-notice.service.js'

describe('Jobs - Renewal Notice - Send Renewal Notice service', () => {
  const recipients = [{ licence_refs: generateLicenceRef() }]

  let expectedRenewalDate
  let expiredDate
  let noticeId
  let requestedNoticeType
  let notifications
  let todayDate

  beforeEach(() => {
    noticeId = generateUUID()
    notifications = [{ id: generateUUID() }]

    todayDate = new Date('2026-04-15')

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

  describe('when the "requestedNoticeType" is "finals"', () => {
    beforeEach(() => {
      requestedNoticeType = 'finals'

      // 90 days in the future of the test date
      expiredDate = new Date('2026-07-14')
      // 90 days before the expired date
      expectedRenewalDate = new Date('2026-04-15')
    })

    describe('and there are renewal finals to send', () => {
      it('returns the recipients', async () => {
        const result = await SendRenewalNoticeService(requestedNoticeType)

        expect(result).toEqual(recipients)
      })

      it('creates a notice for renewal finals', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        const [firstArg, secondArg, thirdArg] = CreateNoticeService.default.mock.calls[0]

        // Argument 1: Notice type
        expect(firstArg).toMatchObject({
          name: 'Renewals: final',
          noticeType: 'renewalFinals',
          subType: 'renewalFinal'
        })

        expect(firstArg.referenceCode).toMatch(/^REFN-/)
        expect(firstArg.expiryDate.getTime()).toEqual(expiredDate.getTime())
        expect(firstArg.renewalDate.getTime()).toEqual(expectedRenewalDate.getTime())

        // Argument 2: The Recipients List
        expect(secondArg).toEqual(recipients)

        // Argument 3: The issuer email
        expect(thirdArg).toEqual('notify@test.gov.uk')
      })

      it('creates the notifications', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        const [firstArg, secondArg, thirdArg] = CreateNotificationsService.default.mock.calls[0]

        // Argument 1: Notice type
        expect(firstArg).toMatchObject({
          name: 'Renewals: final',
          noticeType: 'renewalFinals',
          subType: 'renewalFinal'
        })

        expect(firstArg.referenceCode).toMatch(/^REFN-/)
        expect(firstArg.expiryDate.getTime()).toEqual(expiredDate.getTime())
        expect(firstArg.renewalDate.getTime()).toEqual(expectedRenewalDate.getTime())

        // Argument 2: The Recipients List
        expect(secondArg).toEqual(recipients)

        // Argument 3: The notice id
        expect(thirdArg).toEqual(noticeId)
      })

      it('sends the notice', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        const [firstArg, secondArg] = SendNoticeService.default.mock.calls[0]

        // Argument 1: The notice
        expect(firstArg).toMatchObject({ id: noticeId })

        // Argument 2: The notifications
        expect(secondArg).toEqual(notifications)
      })
    })

    describe('but there are no renewal finals to send', () => {
      beforeEach(() => {
        vi.spyOn(FetchRenewalRecipients, 'default').mockResolvedValue([])
      })

      it('returns the empty recipients', async () => {
        const result = await SendRenewalNoticeService(requestedNoticeType)

        expect(result).toEqual([])
      })

      it('does not call the services', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        expect(CreateNoticeService.default).not.toHaveBeenCalled()
        expect(CreateNotificationsService.default).not.toHaveBeenCalled()
        expect(SendNoticeService.default).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the "requestedNoticeType" is "invitations"', () => {
    beforeEach(() => {
      requestedNoticeType = 'invitations'

      // 300 days in the future of the test date
      expiredDate = new Date('2027-02-09')
      // 90 days before the expired date
      expectedRenewalDate = new Date('2026-11-11')
    })

    describe('and there are renewal invitations to send', () => {
      it('returns the recipients', async () => {
        const result = await SendRenewalNoticeService(requestedNoticeType)

        expect(result).toEqual(recipients)
      })

      it('creates a notice for renewal invitations', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

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
        await SendRenewalNoticeService(requestedNoticeType)

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
        await SendRenewalNoticeService(requestedNoticeType)

        const [firstArg, secondArg] = SendNoticeService.default.mock.calls[0]

        // Argument 1: The notice
        expect(firstArg).toMatchObject({ id: noticeId })

        // Argument 2: The notifications
        expect(secondArg).toEqual(notifications)
      })
    })

    describe('but there are no renewal invitations to send', () => {
      beforeEach(() => {
        vi.spyOn(FetchRenewalRecipients, 'default').mockResolvedValue([])
      })

      it('returns the empty recipients', async () => {
        const result = await SendRenewalNoticeService(requestedNoticeType)

        expect(result).toEqual([])
      })

      it('does not call the services', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        expect(CreateNoticeService.default).not.toHaveBeenCalled()
        expect(CreateNotificationsService.default).not.toHaveBeenCalled()
        expect(SendNoticeService.default).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the "requestedNoticeType" is "reminders"', () => {
    beforeEach(() => {
      requestedNoticeType = 'reminders'

      // 120 days in the future of the test date
      expiredDate = new Date('2026-08-13')
      // 90 days before the expired date
      expectedRenewalDate = new Date('2026-05-15')
    })

    describe('and there are renewal reminders to send', () => {
      it('returns the recipients', async () => {
        const result = await SendRenewalNoticeService(requestedNoticeType)

        expect(result).toEqual(recipients)
      })

      it('creates a notice for renewal reminders', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        const [firstArg, secondArg, thirdArg] = CreateNoticeService.default.mock.calls[0]

        // Argument 1: Notice type
        expect(firstArg).toMatchObject({
          name: 'Renewals: reminder',
          noticeType: 'renewalReminders',
          subType: 'renewalReminder'
        })

        expect(firstArg.referenceCode).toMatch(/^RERM-/)
        expect(firstArg.expiryDate.getTime()).toEqual(expiredDate.getTime())
        expect(firstArg.renewalDate.getTime()).toEqual(expectedRenewalDate.getTime())

        // Argument 2: The Recipients List
        expect(secondArg).toEqual(recipients)

        // Argument 3: The issuer email
        expect(thirdArg).toEqual('notify@test.gov.uk')
      })

      it('creates the notifications', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        const [firstArg, secondArg, thirdArg] = CreateNotificationsService.default.mock.calls[0]

        // Argument 1: Notice type
        expect(firstArg).toMatchObject({
          name: 'Renewals: reminder',
          noticeType: 'renewalReminders',
          subType: 'renewalReminder'
        })

        expect(firstArg.referenceCode).toMatch(/^RERM-/)
        expect(firstArg.expiryDate.getTime()).toEqual(expiredDate.getTime())
        expect(firstArg.renewalDate.getTime()).toEqual(expectedRenewalDate.getTime())

        // Argument 2: The Recipients List
        expect(secondArg).toEqual(recipients)

        // Argument 3: The notice id
        expect(thirdArg).toEqual(noticeId)
      })

      it('sends the notice', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        const [firstArg, secondArg] = SendNoticeService.default.mock.calls[0]

        // Argument 1: The notice
        expect(firstArg).toMatchObject({ id: noticeId })

        // Argument 2: The notifications
        expect(secondArg).toEqual(notifications)
      })
    })

    describe('but there are no renewal reminders to send', () => {
      beforeEach(() => {
        vi.spyOn(FetchRenewalRecipients, 'default').mockResolvedValue([])
      })

      it('returns the empty recipients', async () => {
        const result = await SendRenewalNoticeService(requestedNoticeType)

        expect(result).toEqual([])
      })

      it('does not call the services', async () => {
        await SendRenewalNoticeService(requestedNoticeType)

        expect(CreateNoticeService.default).not.toHaveBeenCalled()
        expect(CreateNotificationsService.default).not.toHaveBeenCalled()
        expect(SendNoticeService.default).not.toHaveBeenCalled()
      })
    })
  })
})
