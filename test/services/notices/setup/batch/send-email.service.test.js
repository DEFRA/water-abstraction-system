'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationsFixture = require('../../../../fixtures/notifications.fixture.js')
const NotifyResponseFixture = require('../../../../fixtures/notify-response.fixture.js')
const { generateReferenceCode } = require('../../../../support/helpers/notification.helper.js')

// Things we need to stub
const CreateEmailRequest = require('../../../../../app/requests/notify/create-email.request.js')

// Thing under test
const SendEmailService = require('../../../../../app/services/notices/setup/batch/send-email.service.js')

describe('Notices - Setup - Batch - Send Email service', () => {
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateReferenceCode()
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).email

    Sinon.stub(CreateEmailRequest, 'send').onCall(0).resolves(notifyResponse)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('should return the notification notify response', async () => {
    const result = await SendEmailService.go(notification, referenceCode)

    expect(result).to.equal({
      id: notification.id,
      notifyId: notifyResponse.response.body.id,
      notifyStatus: 'created',
      plaintext: 'Dear licence holder,\r\n',
      status: 'pending'
    })
  })
})
