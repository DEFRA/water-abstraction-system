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
const CreateLetterRequest = require('../../../../../app/requests/notify/create-letter.request.js')

// Thing under test
const SendLetterService = require('../../../../../app/services/notices/setup/batch/send-letter.service.js')

describe('Notices - Setup - Batch - Send Letter service', () => {
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateReferenceCode()
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).letter

    Sinon.stub(CreateLetterRequest, 'send').onCall(0).resolves(notifyResponse)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('should return the notification notify response', async () => {
    const result = await SendLetterService.go(notification, referenceCode)

    expect(result).to.equal({
      id: notification.id,
      notifyId: notifyResponse.response.body.id,
      notifyStatus: 'created',
      plaintext: 'Dear Licence holder,\r\n',
      status: 'pending'
    })
  })
})
