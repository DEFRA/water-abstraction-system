'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

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
    Sinon.stub(FetchRenewalRecipients, 'go').resolves(recipients)

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

      expect(result).to.equal(recipients)
    })

    it('creates a notice for renewal invitations', async () => {
      await SendRenewalInvitations.go(days)

      const [firstArg, secondArg, thirdArg] = createNoticeStub.firstCall.args

      // Argument 1: Notice type
      expect(firstArg).to.contain({
        name: 'Renewals: invitation',
        noticeType: 'renewalInvitations',
        subType: 'renewalInvitation'
      })

      expect(firstArg.referenceCode).to.startWith('REIN-')
      expect(firstArg.expiryDate.getTime()).to.equal(expiredDate.getTime())
      expect(firstArg.renewalDate.getTime()).to.equal(expectedRenewalDate.getTime())

      // Argument 2: The Recipients List
      expect(secondArg).to.equal(recipients)

      // Argument 3: The issuer email
      expect(thirdArg).to.equal('notify@test.gov.uk')
    })

    it('creates the notifications', async () => {
      await SendRenewalInvitations.go(days)

      const [firstArg, secondArg, thirdArg] = createNotificationStub.firstCall.args

      // Argument 1: Notice type
      expect(firstArg).to.contain({
        name: 'Renewals: invitation',
        noticeType: 'renewalInvitations',
        subType: 'renewalInvitation'
      })

      expect(firstArg.referenceCode).to.startWith('REIN-')
      expect(firstArg.expiryDate.getTime()).to.equal(expiredDate.getTime())
      expect(firstArg.renewalDate.getTime()).to.equal(expectedRenewalDate.getTime())

      // Argument 2: The Recipients List
      expect(secondArg).to.equal(recipients)

      // Argument 3: The notice id
      expect(thirdArg).to.equal(noticeId)
    })

    it('sends the notice', async () => {
      await SendRenewalInvitations.go(days)

      const [firstArg, secondArg] = sendNoticeStub.firstCall.args

      // Argument 1: The notice
      expect(firstArg).to.contain({ id: noticeId })

      // Argument 2: The notifications
      expect(secondArg).to.equal(notifications)
    })

    describe('the "expiredDate"', () => {
      describe('when the the day is ', () => {
        describe('"2026-04-15"', () => {
          it('call the "FetchRenewalRecipients" with an expiry date 300 days from the test date', async () => {
            await SendRenewalInvitations.go(days)

            const actualArgs = FetchRenewalRecipients.go.getCall(0).args[0]

            expect(actualArgs).to.equal(expiredDate)
          })
        })

        describe('"06/08/2027"', () => {
          beforeEach(() => {
            todayDate = new Date('2026-10-10')

            expiredDate = new Date('2027-08-06')

            clock.setSystemTime(todayDate)
          })

          it('call the "FetchRenewalRecipients" with an expiry date 300 days from the test date', async () => {
            await SendRenewalInvitations.go(days)

            const actualArgs = FetchRenewalRecipients.go.getCall(0).args[0]

            expect(actualArgs).to.equal(expiredDate)
          })
        })
      })
    })

    describe('the "renewalDate"', () => {
      describe('when the date is "2026-04-15"', () => {
          it('sets the renewal date 90 days before the expired date', async () => {
            await SendRenewalInvitations.go(days)

            const firstArgs = createNoticeStub.firstCall.args[0]

            expect(firstArgs.renewalDate.getTime()).to.equal(expectedRenewalDate.getTime())
          })
        })
      })
    })
  })
})
