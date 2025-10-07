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
const PreparePaperReturnService = require('../../../../../app/services/notices/setup/prepare-paper-return.service.js')

// Thing under test
const SendPaperReturnService = require('../../../../../app/services/notices/setup/batch/send-return-form.service.js')

describe('Notices - Setup - Batch - Send Paper Return service', () => {
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
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the notification is successful', () => {
    beforeEach(() => {
      Sinon.stub(PreparePaperReturnService, 'go').resolves({
        succeeded: true,
        response: { body: buffer }
      })
    })

    it('should return the notification notify response', async () => {
      const result = await SendPaperReturnService.go(notification, referenceCode)

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

  describe('when generating the return form fails', () => {
    beforeEach(() => {
      Sinon.stub(PreparePaperReturnService, 'go').resolves({
        succeeded: false,
        response: { code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND gotenberg' }
      })
    })

    it('should return the notification notify response', async () => {
      const result = await SendPaperReturnService.go(notification, referenceCode)

      expect(result).to.equal({
        id: notification.id,
        notifyError:
          '{"status":"ENOTFOUND","message":"Failed to generate the return form PDF","errors":["getaddrinfo ENOTFOUND gotenberg"]}',
        status: 'error'
      })
    })
  })
})
