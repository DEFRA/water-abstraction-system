import http2 from 'node:http2'

// Things we need to stub
import * as LegacyRequest from '../../../app/requests/legacy.request.js'

// Thing under test
import * as DeleteBillLicenceRequest from '../../../app/requests/legacy/delete-bill-licence.request.js'

const { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_UNAUTHORIZED } = http2.constants

describe('Legacy Delete Bill Licence request', () => {
  const billLicenceId = '8feaf2c1-f7cd-47f1-93b9-0d2218d20d56'
  const user = { id: '1c4ce580-9053-4531-ba23-d0cf0caf0562', username: 'carol.shaw@atari.com' }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request can delete a bill licence', () => {
    beforeEach(async () => {
      vi.spyOn(LegacyRequest, 'deleteRequest').mockResolvedValue({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_NO_CONTENT,
          body: null
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await DeleteBillLicenceRequest.send(billLicenceId, user)

      expect(result.succeeded).toBe(true)
    })

    it('returns a 204 - ok', async () => {
      const result = await DeleteBillLicenceRequest.send(billLicenceId, user)

      expect(result.response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
      expect(result.response.body).toBeNull()
    })
  })

  describe('when the request cannot delete a bill licence', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        vi.spyOn(LegacyRequest, 'deleteRequest').mockResolvedValue({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_UNAUTHORIZED,
            body: {
              statusCode: HTTP_STATUS_UNAUTHORIZED,
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              attributes: { error: 'Invalid JWT: Token format not valid' }
            }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await DeleteBillLicenceRequest.send(billLicenceId, user)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await DeleteBillLicenceRequest.send(billLicenceId, user)

        expect(result.response.body.statusCode).toEqual(HTTP_STATUS_UNAUTHORIZED)
        expect(result.response.body.error).toEqual('Unauthorized')
        expect(result.response.body.message).toEqual('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        vi.spyOn(LegacyRequest, 'deleteRequest').mockResolvedValue({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await DeleteBillLicenceRequest.send(billLicenceId, user)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await DeleteBillLicenceRequest.send(billLicenceId, user)

        expect(result.response.statusCode).toBeUndefined()
        expect(result.response.body).toBeUndefined()
        expect(result.response.message).toEqual("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
