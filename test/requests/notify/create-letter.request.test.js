// Test helpers
import http2 from 'node:http2'
import { NOTIFY_TEMPLATES } from '../../../app/lib/notify-templates.lib.js'

// Things we need to stub
import * as NotifyRequest from '../../../app/requests/notify.request.js'

// Thing under test
import * as CreateLetterRequest from '../../../app/requests/notify/create-letter.request.js'
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_OK } = http2.constants

describe('Notify - Create Letter request', () => {
  let options
  let response
  let templateId

  beforeEach(() => {
    options = {
      personalisation: {
        address_line_1: 'Amala Bird',
        address_line_2: '123 High Street',
        address_line_3: 'Richmond upon Thames',
        address_line_4: 'Middlesex',
        address_line_5: 'SW14 6BF',
        name: 'Amala Bird',
        periodEndDate: '28th January 2025',
        periodStartDate: '1st January 2025',
        returnDueDate: '28th April 2025'
      },
      reference: 'RINV-G2UYT8'
    }

    templateId = NOTIFY_TEMPLATES.invitations.standard.letter['licence holder']
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: HTTP_STATUS_OK,
        body: {
          content: {
            body: 'Dear Amala Bird,\r\n',
            subject: 'Submit your water abstraction returns by 28th April 2025'
          },
          id: '0f864b1c-eddf-463e-9df6-035e1e83b550',
          reference: options.reference,
          scheduled_for: null,
          template: {
            id: templateId,
            uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${templateId}`,
            version: 32
          },
          uri: 'https://api.notifications.service.gov.uk/v2/notifications/0f864b1c-eddf-463e-9df6-035e1e83b550'
        }
      }

      vi.spyOn(NotifyRequest, 'postRequest').mockResolvedValue({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CreateLetterRequest.send(templateId, options)

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await CreateLetterRequest.send(templateId, options)

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
        const result = await CreateLetterRequest.send(templateId, options)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateLetterRequest.send(templateId, options)

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
