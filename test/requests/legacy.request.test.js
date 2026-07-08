// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_NO_CONTENT, HTTP_STATUS_OK } = http2.constants
import legacyConfig from '../../config/legacy.config.js'

// Things we need to stub
import * as BaseRequest from '../../app/requests/base.request.js'

// Thing under test
import * as LegacyRequest from '../../app/requests/legacy.request.js'

describe('Legacy Request', () => {
  const testPath = 'abstraction/info'

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('#delete()', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'deleteRequest').mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_NO_CONTENT,
            body: {}
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequest.deleteRequest('import', testPath)

        const requestArgs = BaseRequest.deleteRequest.firstCall.args

        expect(requestArgs[0]).toEqual(testPath)
        expect(requestArgs[1].prefixUrl).toEqual(`${legacyConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).toEqual({ authorization: `Bearer ${legacyConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).toEqual('json')
      })

      it('returns a "true" success status', async () => {
        const result = await LegacyRequest.deleteRequest('import', testPath)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequest.deleteRequest('import', testPath)

        expect(result.response.body).toEqual({})
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.deleteRequest('import', testPath)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NO_CONTENT)
      })

      it('can handle none API requests', async () => {
        await LegacyRequest.deleteRequest('import', testPath, null, false)

        const requestArgs = BaseRequest.deleteRequest.firstCall.args

        expect(requestArgs[1].prefixUrl).toEqual(legacyConfig.import.url)
      })

      it('can add the defra-user-id header', async () => {
        await LegacyRequest.deleteRequest('import', testPath, 1234, true)

        const requestArgs = BaseRequest.deleteRequest.firstCall.args

        expect(requestArgs[1].headers['defra-internal-user-id']).toEqual(1234)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'deleteRequest').mockResolvedValue({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LegacyRequest.deleteRequest('import', testPath)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await LegacyRequest.deleteRequest('import', testPath)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.deleteRequest('import', testPath)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequest.deleteRequest('foobar', testPath)).rejects.toThrow(
          'Request to unknown legacy service foobar'
        )
      })
    })
  })

  describe('#get()', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'getRequest').mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequest.getRequest('import', testPath)

        const requestArgs = BaseRequest.getRequest.firstCall.args

        expect(requestArgs[0]).toEqual(testPath)
        expect(requestArgs[1].prefixUrl).toEqual(`${legacyConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).toEqual({ authorization: `Bearer ${legacyConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).toEqual('json')
        expect(requestArgs[1].json).toBeUndefined()
      })

      it('returns a "true" success status', async () => {
        const result = await LegacyRequest.getRequest('import', testPath)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequest.getRequest('import', testPath)

        expect(result.response.body.version).toEqual('3.1.2')
        expect(result.response.body.commit).toEqual('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.getRequest('import', testPath)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })

      it('can handle none API requests', async () => {
        await LegacyRequest.getRequest('import', testPath, null, false)

        const requestArgs = BaseRequest.getRequest.firstCall.args

        expect(requestArgs[1].prefixUrl).toEqual(legacyConfig.import.url)
      })

      it('can add the defra-user-id header', async () => {
        await LegacyRequest.getRequest('import', testPath, 1234, false)

        const requestArgs = BaseRequest.getRequest.firstCall.args

        expect(requestArgs[1].headers['defra-internal-user-id']).toEqual(1234)
      })
    })

    describe('when the request fails', () => {
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
        const result = await LegacyRequest.getRequest('import', testPath)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await LegacyRequest.getRequest('import', testPath)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.getRequest('import', testPath)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequest.getRequest('foobar', testPath)).rejects.toThrow('Request to unknown legacy service foobar')
      })
    })
  })

  describe('#post()', () => {
    const requestBody = { name: 'water' }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'postRequest').mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequest.postRequest('import', testPath, null, true, requestBody)

        const requestArgs = BaseRequest.postRequest.firstCall.args

        expect(requestArgs[0]).toEqual(testPath)
        expect(requestArgs[1].prefixUrl).toEqual(`${legacyConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).toEqual({ authorization: `Bearer ${legacyConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).toEqual('json')
        expect(requestArgs[1].json).toEqual(requestBody)
      })

      it('returns a "true" success status', async () => {
        const result = await LegacyRequest.postRequest('import', testPath, null, true, requestBody)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequest.postRequest('import', testPath, null, true, requestBody)

        expect(result.response.body.version).toEqual('3.1.2')
        expect(result.response.body.commit).toEqual('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.postRequest('import', testPath, null, true, requestBody)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_OK)
      })

      it('can handle none API requests', async () => {
        await LegacyRequest.postRequest('import', testPath, null, false, requestBody)

        const requestArgs = BaseRequest.postRequest.firstCall.args

        expect(requestArgs[1].prefixUrl).toEqual(legacyConfig.import.url)
      })

      it('can add the defra-user-id header', async () => {
        await LegacyRequest.postRequest('import', testPath, 1234, false, requestBody)

        const requestArgs = BaseRequest.postRequest.firstCall.args

        expect(requestArgs[1].headers['defra-internal-user-id']).toEqual(1234)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        vi.spyOn(BaseRequest, 'postRequest').mockResolvedValue({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            statusMessage: 'Not Found',
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LegacyRequest.postRequest('import', testPath, null, true, requestBody)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await LegacyRequest.postRequest('import', testPath, null, true, requestBody)

        expect(result.response.body.message).toEqual('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.postRequest('import', testPath, null, true, requestBody)

        expect(result.response.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequest.postRequest('foobar', testPath, null, true, requestBody)).rejects.toThrow(
          'Request to unknown legacy service foobar'
        )
      })
    })
  })
})
