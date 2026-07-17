// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as NotifyRequest from '../../../app/requests/notify.request.js'

// Thing under test
import ViewMessageDataRequest from '../../../app/requests/notify/view-message-data.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Notify - View Message Data request', () => {
  const notificationId = '5a714bec-4ca0-45ba-8edf-8fa37db09499'

  let response

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: HTTP_STATUS_OK,
        body: {
          body: 'Dear licence holder,\r\n',
          completed_at: '2025-08-21T17:26:20.737851Z',
          cost_details: {},
          cost_in_pounds: 0,
          created_at: '2025-08-21T17:26:20.620698Z',
          created_by_name: null,
          email_address: 'alan.cruikshanks@defra.gov.uk',
          id: '44bdb4e2-21cb-492c-84f6-90c2348275b4',
          is_cost_data_ready: true,
          line_1: null,
          line_2: null,
          line_3: null,
          line_4: null,
          line_5: null,
          line_6: null,
          one_click_unsubscribe_url: null,
          phone_number: null,
          postage: null,
          postcode: null,
          reference: 'RINV-H1EZR5',
          scheduled_for: null,
          sent_at: '2025-08-21T17:26:20.675046Z',
          status: 'delivered',
          subject: 'Submit your water abstraction returns by 28th April 2025',
          template: {
            id: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
            uri: 'https://api.notifications.service.gov.uk/v2/template/2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f/version/40',
            version: 40
          },
          type: 'email'
        }
      }

      vi.spyOn(NotifyRequest, 'getRequest').mockResolvedValue({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewMessageDataRequest(notificationId)

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await ViewMessageDataRequest(notificationId)

      expect(result.response.body).toEqual(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: HTTP_STATUS_NOT_FOUND,
          body: {
            errors: [
              {
                error: 'NoResultFound',
                message: 'No result found'
              }
            ],
            status_code: HTTP_STATUS_NOT_FOUND
          }
        }

        vi.spyOn(NotifyRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewMessageDataRequest(notificationId)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewMessageDataRequest(notificationId)

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
