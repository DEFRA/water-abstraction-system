// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_OK } = http2.constants
import { NOTIFY_TEMPLATES } from '../../../app/lib/notify-templates.lib.js'

// Things we need to stub
import * as NotifyRequest from '../../../app/requests/notify.request.js'

// Thing under test
import * as CreateEmailRequest from '../../../app/requests/notify/create-email.request.js'

describe('Notify - Create Email request', () => {
  let emailAddress
  let options
  let response
  let templateId

  beforeEach(() => {
    emailAddress = 'hello@example.com'

    options = {
      personalisation: {
        periodEndDate: '28th January 2025',
        periodStartDate: '1st January 2025',
        returnDueDate: '28th April 2025'
      },
      reference: 'RINV-H1EZR5'
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
          content: {
            body: 'Dear licence holder,\r\n',
            from_email: 'environment.agency.water.resources.licensing.service@notifications.service.gov.uk',
            one_click_unsubscribe_url: null,
            subject: 'Submit your water abstraction returns by 28th April 2025'
          },
          id: 'a8023182-5cb3-4ee3-b777-2fb82cde7fc5',
          reference: options.reference,
          scheduled_for: null,
          template: {
            id: templateId,
            uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${templateId}`,
            version: 40
          },
          uri: 'https://api.notifications.service.gov.uk/v2/notifications/a8023182-5cb3-4ee3-b777-2fb82cde7fc5'
        }
      }

      vi.spyOn(NotifyRequest, 'postRequest').mockResolvedValue({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CreateEmailRequest.send(templateId, emailAddress, options)

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await CreateEmailRequest.send(templateId, emailAddress, options)

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
        const result = await CreateEmailRequest.send(templateId, emailAddress, options)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateEmailRequest.send(templateId, emailAddress, options)

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
