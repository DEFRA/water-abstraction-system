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
const CreatePrecompiledFileRequest = require('../../../../../app/requests/notify/create-precompiled-file.request.js')
const PrepareReturnFormsService = require('../../../../../app/services/notices/setup/prepare-return-forms.service.js')

// Thing under test
const SendReturnFormService = require('../../../../../app/services/notices/setup/batch/send-return-form.service.js')

describe('Notices - Setup - Batch - Send Return form service', () => {
  let buffer
  let notification
  let notifyResponse
  let referenceCode

  beforeEach(async () => {
    referenceCode = generateReferenceCode()
    notification = NotificationsFixture.notification().notification

    notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode).pdf

    Sinon.stub(CreatePrecompiledFileRequest, 'send').onCall(0).resolves(notifyResponse)

    buffer = Buffer.from('mock file')

    Sinon.stub(PrepareReturnFormsService, 'go').resolves(buffer)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('should return the notification notify response', async () => {
    const result = await SendReturnFormService.go(notification, referenceCode)

    expect(result).to.equal({
      id: notification.id,
      notifyId: notifyResponse.response.body.id,
      notifyStatus: 'created',
      pdf: buffer,
      plaintext: null,
      status: 'pending'
    })
  })
})
