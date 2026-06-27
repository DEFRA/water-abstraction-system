'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const CreateNoticeService = require('../../../../app/services/notices/setup/create-notice.service.js')
const CreateNotificationsService = require('../../../../app/services/notices/setup/create-notifications.service.js')
const FetchRenewalRecipients = require('../../../../app/services/jobs/renewal-invitations/fetch-renewal-recipients.service.js')
const NotifyConfig = require('../../../../config/notify.config.js')
const SendNoticeService = require('../../../../app/services/notices/setup/send/send-notice.service.js')

// Thing under test
const SendRenewalInvitations = require('../../../../app/services/jobs/renewal-invitations/send-renewal-invitations.service.js')

describe('Jobs - Renewal Invitations - Send Renewal Invitations service', () => {
  const days = '300'
  const recipients = [{ licence_refs: generateLicenceRef() }]

  let clock
  let createNoticeStub
  let createNotificationStub
  let expectedRenewalDate
  let expiredDate
  let fetchRenewalRecipientsStub
  let noticeId
  let notifications
  let sendNoticeStub
  let todayDate

  beforeEach(() => {
    noticeId = generateUUID()
    notifications = [{ id: generateUUID() }]

    todayDate = new Date('2026-04-15')

    // 300 days in the future of the test date
    expiredDate = new Date('2027-02-09')
    // 90 days before the expired date
    expectedRenewalDate = new Date('2026-11-11')

    clock = Sinon.useFakeTimers(todayDate)

    Sinon.stub(NotifyConfig, 'replyTo').value('notify@test.gov.uk')

    fetchRenewalRecipientsStub = Sinon.stub(FetchRenewalRecipients, 'go').resolves(recipients)
    createNoticeStub = Sinon.stub(CreateNoticeService, 'go').resolves({ id: noticeId })
    createNotificationStub = Sinon.stub(CreateNotificationsService, 'go').resolves(notifications)
    sendNoticeStub = Sinon.stub(SendNoticeService, 'go').resolves()
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when there are renewal invitations to send', () => {
    it('returns the recipients', async () => {
      const result = await SendRenewalInvitations.go(days)

      expect(result).toEqual(recipients)
    })

    it('creates a notice for renewal invitations', async () => {
      await SendRenewalInvitations.go(days)

      const [firstArg, secondArg, thirdArg] = createNoticeStub.firstCall.args

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
      await SendRenewalInvitations.go(days)

      const [firstArg, secondArg, thirdArg] = createNotificationStub.firstCall.args

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
      await SendRenewalInvitations.go(days)

      const [firstArg, secondArg] = sendNoticeStub.firstCall.args

      // Argument 1: The notice
      expect(firstArg).toMatchObject({ id: noticeId })

      // Argument 2: The notifications
      expect(secondArg).toEqual(notifications)
    })
  })

  describe('when there are no renewal invitations to send', () => {
    beforeEach(() => {
      fetchRenewalRecipientsStub.resolves([])
    })

    it('returns the empty recipients', async () => {
      const result = await SendRenewalInvitations.go(days)

      expect(result).toEqual([])
    })

    it('does not call the services', async () => {
      await SendRenewalInvitations.go(days)

      expect(createNoticeStub.called).toBe(false)
      expect(createNotificationStub.called).toBe(false)
      expect(sendNoticeStub.called).toBe(false)
    })
  })
})
