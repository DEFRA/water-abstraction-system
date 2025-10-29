'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const GotenbergRequest = require('../../../app/requests/gotenberg.request.js')

// Thing under test
const GeneratePaperReturnRequest = require('../../../app/requests/gotenberg/generate-paper-return.request.js')

describe('Gotenberg - Generate Paper return Request', () => {
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
          statusCode: 204,
          body: pdfBytes
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await GeneratePaperReturnRequest.send(pageData)

      expect(result.succeeded).to.be.true()
    })

    it('returns the data', async () => {
      const result = await GeneratePaperReturnRequest.send(pageData)

      expect(result.response).to.equal({
        statusCode: 204,
        body: pdfBytes
      })
    })

    describe('calls "GotenbergRequest.post" with FormData', () => {
      it('containing the expected fields', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(
          GotenbergRequest.post.calledWithMatch('forms/chromium/convert/html', Sinon.match.instanceOf(FormData))
        ).to.be.true()

        // Check the html has been added to the form data
        const appendCall = FormData.prototype.append.getCall(0)
        expect(appendCall).to.exist()
        const blob = appendCall.args[1]
        expect(blob).to.be.instanceOf(Blob)
        const content = await blob.text()
        expect(content).to.include('<!DOCTYPE html>')

        // Check all append calls
        expect(FormData.prototype.append.calledWith('marginTop', '0')).to.be.true()
        expect(FormData.prototype.append.calledWith('marginBottom', '0')).to.be.true()
        expect(FormData.prototype.append.calledWith('marginLeft', '0')).to.be.true()
        expect(FormData.prototype.append.calledWith('marginRight', '0')).to.be.true()
        expect(FormData.prototype.append.calledWith('preferCssPageSize', 'true')).to.be.true()
      })

      it('containing the html', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(
          GotenbergRequest.post.calledWithMatch('forms/chromium/convert/html', Sinon.match.instanceOf(FormData))
        ).to.be.true()

        // Get the second call to append (index 0) - this should be the html file
        const appendCall = FormData.prototype.append.getCall(0)
        expect(appendCall).to.exist()

        // Check that the second argument (the value being appended) is a Blob
        const blob = appendCall.args[1]
        expect(blob).to.be.instanceOf(Blob)

        // Verify the blob content contains '<!DOCTYPE html>'
        const content = await blob.text()
        expect(content).to.include('<!DOCTYPE html>')

        // Verify the complete append call signature
        expect(
          FormData.prototype.append.calledWith('index.html', Sinon.match.instanceOf(Blob), 'index.html')
        ).to.be.true()
      })

      it('containing the footer', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(
          GotenbergRequest.post.calledWithMatch('forms/chromium/convert/html', Sinon.match.instanceOf(FormData))
        ).to.be.true()

        // Get the second call to append (index 1) - this should be the footer file
        const appendCall = FormData.prototype.append.getCall(1)
        expect(appendCall).to.exist()

        // Check that the second argument (the value being appended) is a Blob
        const blob = appendCall.args[1]
        expect(blob).to.be.instanceOf(Blob)

        // Verify the blob content contains 'footer'
        const content = await blob.text()
        expect(content).to.include('footer')

        // Verify the complete append call signature
        expect(FormData.prototype.append.calledWith('files', Sinon.match.instanceOf(Blob), 'footer.html')).to.be.true()
      })
    })
  })
})
