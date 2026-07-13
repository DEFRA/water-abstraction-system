import http2 from 'node:http2'

// Test framework dependencies

// Things we need to stub
import * as GotenbergRequest from '../../../app/requests/gotenberg.request.js'

// Thing under test
import * as GeneratePaperReturnRequest from '../../../app/requests/gotenberg/generate-paper-return.request.js'
const { HTTP_STATUS_NO_CONTENT } = http2.constants

describe('Gotenberg - Generate Paper Return Request', () => {
  let gotenbergRequestStub
  let pageData
  let pdfBytes

  beforeEach(() => {
    gotenbergRequestStub = vi.spyOn(GotenbergRequest, 'postRequest').mockImplementation(() => {})

    pdfBytes = new TextEncoder().encode('%PDF-1.4\n%âãÏÓ\n').buffer

    pageData = {
      title: 'test file'
    }

    vi.spyOn(FormData.prototype, 'append')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request can create a file', () => {
    beforeEach(async () => {
      gotenbergRequestStub.mockResolvedValue({
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

    describe('calls "GotenbergRequest.postRequest" with FormData', () => {
      it('containing the expected fields', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(GotenbergRequest.postRequest).toHaveBeenCalledWith('forms/chromium/convert/html', expect.any(FormData))

        // Check the html has been added to the form data
        const appendCall = FormData.prototype.append.mock.calls[0]
        expect(appendCall).toBeDefined()
        const blob = appendCall[1]
        expect(blob).toBeInstanceOf(Blob)
        const content = await blob.text()
        expect(content).toContain('<!DOCTYPE html>')

        // Check all append calls
        expect(FormData.prototype.append).toHaveBeenCalledWith('marginTop', '0')
        expect(FormData.prototype.append).toHaveBeenCalledWith('marginBottom', '0')
        expect(FormData.prototype.append).toHaveBeenCalledWith('marginLeft', '0')
        expect(FormData.prototype.append).toHaveBeenCalledWith('marginRight', '0')
        expect(FormData.prototype.append).toHaveBeenCalledWith('preferCssPageSize', 'true')
      })

      it('containing the html', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(GotenbergRequest.postRequest).toHaveBeenCalledWith('forms/chromium/convert/html', expect.any(FormData))

        // Get the second call to append (index 0) - this should be the html file
        const appendCall = FormData.prototype.append.mock.calls[0]
        expect(appendCall).toBeDefined()

        // Check that the second argument (the value being appended) is a Blob
        const blob = appendCall[1]
        expect(blob).toBeInstanceOf(Blob)

        // Verify the blob content contains '<!DOCTYPE html>'
        const content = await blob.text()
        expect(content).toContain('<!DOCTYPE html>')

        // Verify the complete append call signature
        expect(FormData.prototype.append).toHaveBeenCalledWith('index.html', expect.any(Blob), 'index.html')
      })

      it('containing the footer', async () => {
        await GeneratePaperReturnRequest.send(pageData)

        expect(GotenbergRequest.postRequest).toHaveBeenCalledWith('forms/chromium/convert/html', expect.any(FormData))

        // Get the second call to append (index 1) - this should be the footer file
        const appendCall = FormData.prototype.append.mock.calls[1]
        expect(appendCall).toBeDefined()

        // Check that the second argument (the value being appended) is a Blob
        const blob = appendCall[1]
        expect(blob).toBeInstanceOf(Blob)

        // Verify the blob content contains 'footer'
        const content = await blob.text()
        expect(content).toContain('footer')

        // Verify the complete append call signature
        expect(FormData.prototype.append).toHaveBeenCalledWith('files', expect.any(Blob), 'footer.html')
      })
    })
  })
})
