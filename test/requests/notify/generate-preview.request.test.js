// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_OK } = http2.constants
import { NOTIFY_TEMPLATES } from '../../../app/lib/notify-templates.lib.js'

// Things we need to stub
import * as NotifyRequest from '../../../app/requests/notify.request.js'

// Thing under test
import * as GeneratePreviewRequest from '../../../app/requests/notify/generate-preview.request.js'

describe('Notify - Generate Preview request', () => {
  let personalisation
  let response
  let templateId

  beforeEach(() => {
    personalisation = {
      periodEndDate: '28th January 2025',
      periodStartDate: '1st January 2025',
      returnDueDate: '28th April 2025'
    }

    templateId = NOTIFY_TEMPLATES.invitations.standard.email['primary user']
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: HTTP_STATUS_OK,
        body: {
          body: 'Dear licence holder,\r\n',
          html: '"<p style="Margin: 0 0 20px 0; font-size: 19px; line-height: 25px; color: #0B0C0C;">Dear licence holder,</p>',
          id: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
          postage: null,
          subject: 'Submit your water abstraction returns by 28th April 2025',
          type: 'email',
          version: 40
        }
      }

      vi.spyOn(NotifyRequest, 'postRequest').mockResolvedValue({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await GeneratePreviewRequest.send(templateId, personalisation)

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await GeneratePreviewRequest.send(templateId, personalisation)

      expect(result.response.body).toEqual(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: HTTP_STATUS_BAD_REQUEST,
          body: {
            errors: [
              {
                error: 'BadRequestError',
                message: 'Missing personalisation: returnDueDate'
              }
            ],
            status_code: HTTP_STATUS_BAD_REQUEST
          }
        }

        vi.spyOn(NotifyRequest, 'postRequest').mockResolvedValue({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await GeneratePreviewRequest.send(templateId, personalisation)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await GeneratePreviewRequest.send(templateId, personalisation)

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
