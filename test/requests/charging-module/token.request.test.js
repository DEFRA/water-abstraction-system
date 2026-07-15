import http2 from 'node:http2'

// Things we need to stub
import * as BaseRequest from '../../../app/requests/base.request.js'

// Thing under test
import * as TokenRequest from '../../../app/requests/charging-module/token.request.js'
const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } = http2.constants

describe('Charging Module Token request', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request is able to generate a token', () => {
    beforeEach(() => {
      vi.spyOn(BaseRequest, 'postRequest').mockResolvedValue({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body: '{"access_token":"reallylong.stringoflettersandnumbers.in3parts","expires_in":3600,"token_type":"Bearer"}'
        }
      })
    })

    it('returns an object with the access token and how long till it expires', async () => {
      const result = await TokenRequest.send()

      expect(result.accessToken).toEqual('reallylong.stringoflettersandnumbers.in3parts')
      expect(result.expiresIn).toEqual(3600)
    })
  })

  describe('when the request cannot generate a token', () => {
    beforeEach(() => {
      vi.spyOn(BaseRequest, 'postRequest').mockResolvedValue({
        succeeded: false,
        response: {
          statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR,
          body: 'Kaboom'
        }
      })
    })

    it('returns an object with empty access token expires in properties', async () => {
      const result = await TokenRequest.send()

      expect(result.accessToken).toBeNull()
      expect(result.expiresIn).toBeNull()
    })
  })
})
