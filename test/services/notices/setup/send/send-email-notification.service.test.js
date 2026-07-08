'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NotificationsFixture = require('../../../../support/fixtures/notifications.fixture.js')
const NotifyResponseFixture = require('../../../../support/fixtures/notify-response.fixture.js')
const { generateNoticeReferenceCode } = require('../../../../../app/lib/general.lib.js')

// Things we need to stub
const CreateEmailRequest = require('../../../../../app/requests/notify/create-email.request.js')

// Thing under test
const SendEmailNotificationService = require('../../../../../app/services/notices/setup/send/send-email-notification.service.js')

describe('Notices - Setup - Send - Send Email Notification service', () => {
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).email

    Sinon.stub(CreateEmailRequest, 'send').onCall(0).resolves(notifyResponse)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('should return the notification notify response', async () => {
    const result = await SendEmailNotificationService(notification, referenceCode)

    expect(result).toEqual({
      id: notification.id,
      notifyId: notifyResponse.response.body.id,
      notifyStatus: 'created',
      plaintext: 'Dear licence holder,\r\n',
      status: 'pending'
    })
  })
})
