'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const SendReturnFormRequest = require('../../../../app/requests/gotenberg/send-return-form.request.js')

// Thing under test
const PreviewReturnFormsService = require('../../../../app/services/notices/setup/preview-return-forms.service.js')

describe('Notices - Setup - Preview Return Forms Service', () => {
  let notifierStub
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })

    const buffer = new TextEncoder().encode('mock file').buffer

    Sinon.stub(SendReturnFormRequest, 'send').resolves({
      response: {
        body: buffer
      }
    })

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when called', () => {
    it('returns generated pdf as an array buffer', async () => {
      const result = await PreviewReturnFormsService.go(session.id)

      expect(result).to.be.instanceOf(ArrayBuffer)
      // The encoded string is 9 chars
      expect(result.byteLength).to.equal(9)
    })

    it('should call "SendReturnFormRequest"', async () => {
      await PreviewReturnFormsService.go(session.id)

      expect(
        SendReturnFormRequest.send.calledWith({
          cover: {
            title: 'Water abstraction day return'
          }
        })
      ).to.be.true()
    })
  })
})
