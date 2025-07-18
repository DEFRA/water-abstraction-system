'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FormData = require('form-data')

// Things we need to stub
const GotenbergRequest = require('../../../app/requests/gotenberg.request.js')
const GenerateReturnFormService = require('../../../app/services/notices/setup/generate-return-form.service.js')

// Thing under test
const SendReturnFormRequest = require('../../../app/requests/gotenberg/send-return-form.request.js')

describe('Gotenberg - Send return form request', () => {
  let gotenbergRequestStub
  let pageData
  let pdfBytes

  beforeEach(() => {
    gotenbergRequestStub = Sinon.stub(GotenbergRequest, 'post')

    pdfBytes = new TextEncoder().encode('%PDF-1.4\n%âãÏÓ\n').buffer

    pageData = {
      title: 'test file'
    }

    Sinon.spy(FormData.prototype, 'append')

    Sinon.stub(GenerateReturnFormService, 'go').returns('<p>test</p>')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request can create a file', () => {
    beforeEach(async () => {
      gotenbergRequestStub.resolves({
        succeeded: true,
        response: {
          statusCode: 204,
          body: pdfBytes
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await SendReturnFormRequest.send(pageData)

      expect(result.succeeded).to.be.true()
    })

    it('returns the data', async () => {
      const result = await SendReturnFormRequest.send(pageData)

      expect(result.response).to.equal({
        statusCode: 204,
        body: pdfBytes
      })
    })

    it('calls "GotenbergRequest.post" with FormData containing the expected fields', async () => {
      await SendReturnFormRequest.send(pageData)

      expect(
        GotenbergRequest.post.calledWithMatch('forms/chromium/convert/html', Sinon.match.instanceOf(FormData))
      ).to.be.true()

      // Check all append calls
      expect(
        // stub this
        FormData.prototype.append.calledWithMatch('index.html', '<p>test</p>', { filename: 'index.html' })
      ).to.be.true()
      expect(FormData.prototype.append.calledWith('marginTop', '0')).to.be.true()
      expect(FormData.prototype.append.calledWith('marginBottom', '0')).to.be.true()
      expect(FormData.prototype.append.calledWith('marginLeft', '0')).to.be.true()
      expect(FormData.prototype.append.calledWith('marginRight', '0')).to.be.true()
      expect(FormData.prototype.append.calledWith('preferCssPageSize', 'true')).to.be.true()
    })
  })
})
