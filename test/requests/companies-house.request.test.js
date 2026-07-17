// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import http2 from 'node:http2'

// Things we need to stub
import * as BaseRequest from '../../app/requests/base.request.js'
import companiesHouseConfig from '../../config/companies-house.config.js'
import serverConfig from '../../config/server.config.js'

// Thing under test
import * as CompaniesHouseRequest from '../../app/requests/companies-house.request.js'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Companies House Request', () => {
  const accessToken = Buffer.from('API_KEY').toString('base64')
  const testRoute = 'TEST_ROUTE'

  let searchParams

  beforeEach(() => {
    vi.replaceProperty(companiesHouseConfig, 'apiKey', 'API_KEY')
    vi.replaceProperty(serverConfig, 'requestTimeout', 1000)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        searchParams = {
          q: 'Company name',
          start_index: 0,
          items_per_page: 15
        }

        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: { items: [{ company_number: '12345678' }] }
          }
        })
      })

      it('calls Companies House with the required options', async () => {
        await CompaniesHouseRequest.getRequest(testRoute, searchParams)

        const requestArgs = BaseRequest.getRequest.mock.calls[0]

        expect(requestArgs[0]).toMatch(/TEST_ROUTE$/)
        expect(requestArgs[1].headers).toMatchObject({ authorization: `Basic ${accessToken}` })
        expect(requestArgs[1].searchParams).toEqual(searchParams)
      })

      it('returns a "true" success status', async () => {
        const result = await CompaniesHouseRequest.getRequest(testRoute, searchParams)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await CompaniesHouseRequest.getRequest(testRoute, searchParams)

        expect(result.response.body.items[0].company_number).toEqual('12345678')
      })

      it('returns the status code', async () => {
        const result = await CompaniesHouseRequest.getRequest(testRoute, searchParams)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })
    })

    describe('when the request fails', () => {
      describe('but returns a body', () => {
        beforeEach(async () => {
          vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
            succeeded: false,
            response: {
              statusCode: HTTP_STATUS_NOT_FOUND,
              statusMessage: 'Not Found',
              body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
            }
          })
        })

        it('returns a "false" success status', async () => {
          const result = await CompaniesHouseRequest.getRequest(testRoute)

          expect(result.succeeded).toBe(false)
        })

        it('returns the error response', async () => {
          const result = await CompaniesHouseRequest.getRequest(testRoute)

          expect(result.response.body.message).toEqual('Not Found')
        })

        it('returns the status code', async () => {
          const result = await CompaniesHouseRequest.getRequest(testRoute)

          expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
        })
      })

      describe('but does not return a body', () => {
        beforeEach(async () => {
          vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
            succeeded: false,
            response: {
              error: 'Something went wrong'
            }
          })
        })

        it('returns a "error"', async () => {
          const result = await CompaniesHouseRequest.getRequest(testRoute)

          expect(result.response.error).toEqual('Something went wrong')
        })
      })
    })
  })
})
