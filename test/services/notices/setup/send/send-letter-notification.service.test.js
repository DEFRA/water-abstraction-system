'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const NotificationsFixture = require('../../../../support/fixtures/notifications.fixture.js')
const NotifyResponseFixture = require('../../../../support/fixtures/notify-response.fixture.js')
const { generateNoticeReferenceCode } = require('../../../../../app/lib/general.lib.js')

// Things we need to stub
const CreateLetterRequest = require('../../../../../app/requests/notify/create-letter.request.js')

// Thing under test
const SendLetterNotificationService = require('../../../../../app/services/notices/setup/send/send-letter-notification.service.js')

describe('Notices - Setup - Send - Send Letter Notification service', () => {
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).letter

    Sinon.stub(CreateLetterRequest, 'send').onCall(0).resolves(notifyResponse)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('should return the notification notify response', async () => {
    const result = await SendLetterNotificationService.go(notification, referenceCode)

    expect(result).toEqual({
      id: notification.id,
      notifyId: notifyResponse.response.body.id,
      notifyStatus: 'created',
      plaintext: 'Dear Licence holder,\r\n',
      status: 'pending'
    })
  })
})
