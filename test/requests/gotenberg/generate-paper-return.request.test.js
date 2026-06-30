'use strict'

const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const GotenbergRequest = require('../../../app/requests/gotenberg.request.js')

// Thing under test
const GeneratePaperReturnRequest = require('../../../app/requests/gotenberg/generate-paper-return.request.js')

describe('Gotenberg - Generate Paper Return Request', () => {
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
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request can create a file', () => {
    beforeEach(async () => {
      gotenbergRequestStub.resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_NO_CONTENT,
          body: pdfBytes
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await GeneratePaperReturnRequest.send(pageData)

      expect(result.succeeded).toBe(true)
    })

    it('returns the data', async () => {
      const result = await GeneratePaperReturnRequest.send(pageData)

      expect(result.response).toEqual({
        statusCode: HTTP_STATUS_NO_CONTENT,
        body: pdfBytes
      })
    })

    describe('calls "GotenbergRequest.post" with FormData', () => {
      it('containing the expected fields', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(
          GotenbergRequest.post.calledWithMatch('forms/chromium/convert/html', Sinon.match.instanceOf(FormData))
        ).toBe(true)

        // Check the html has been added to the form data
        const appendCall = FormData.prototype.append.getCall(0)
        expect(appendCall).toBeDefined()
        const blob = appendCall.args[1]
        expect(blob).toBeInstanceOf(Blob)
        const content = await blob.text()
        expect(content).toContain('<!DOCTYPE html>')

        // Check all append calls
        expect(FormData.prototype.append.calledWith('marginTop', '0')).toBe(true)
        expect(FormData.prototype.append.calledWith('marginBottom', '0')).toBe(true)
        expect(FormData.prototype.append.calledWith('marginLeft', '0')).toBe(true)
        expect(FormData.prototype.append.calledWith('marginRight', '0')).toBe(true)
        expect(FormData.prototype.append.calledWith('preferCssPageSize', 'true')).toBe(true)
      })

      it('containing the html', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(
          GotenbergRequest.post.calledWithMatch('forms/chromium/convert/html', Sinon.match.instanceOf(FormData))
        ).toBe(true)

        // Get the second call to append (index 0) - this should be the html file
        const appendCall = FormData.prototype.append.getCall(0)
        expect(appendCall).toBeDefined()

        // Check that the second argument (the value being appended) is a Blob
        const blob = appendCall.args[1]
        expect(blob).toBeInstanceOf(Blob)

        // Verify the blob content contains '<!DOCTYPE html>'
        const content = await blob.text()
        expect(content).toContain('<!DOCTYPE html>')

        // Verify the complete append call signature
        expect(FormData.prototype.append.calledWith('index.html', Sinon.match.instanceOf(Blob), 'index.html')).toBe(
          true
        )
      })

      it('containing the footer', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(
          GotenbergRequest.post.calledWithMatch('forms/chromium/convert/html', Sinon.match.instanceOf(FormData))
        ).toBe(true)

        // Get the second call to append (index 1) - this should be the footer file
        const appendCall = FormData.prototype.append.getCall(1)
        expect(appendCall).toBeDefined()

        // Check that the second argument (the value being appended) is a Blob
        const blob = appendCall.args[1]
        expect(blob).toBeInstanceOf(Blob)

        // Verify the blob content contains 'footer'
        const content = await blob.text()
        expect(content).toContain('footer')

        // Verify the complete append call signature
        expect(FormData.prototype.append.calledWith('files', Sinon.match.instanceOf(Blob), 'footer.html')).toBe(true)
      })
    })
  })
})
