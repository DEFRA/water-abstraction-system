'use strict'

// Test framework dependencies
const { describe, it, afterEach, expect } = require('@jest/globals')
const RequestLib = require('../../app/lib/request.lib.js')
const LegacyRequestLib = require('../../app/lib/legacy-request.lib.js')
const servicesConfig = require('../../config/services.config.js')

jest.mock('../../app/lib/request.lib.js')

describe('LegacyRequestLib', () => {
  const testPath = 'abstraction/info'

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('#get()', () => {
    describe('when the request succeeds', () => {
      beforeEach(() => {
        RequestLib.get.mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequestLib.get('import', testPath)

        expect(RequestLib.get).toHaveBeenCalledWith(testPath, {
          prefixUrl: `${servicesConfig.import.url}/import/1.0`,
          headers: { authorization: `Bearer ${servicesConfig.legacyAuthToken}` },
          responseType: 'json'
        })
      })

      it('returns a `true` success status', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.response.body.version).toBe('3.1.2')
        expect(result.response.body.commit).toBe('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.response.statusCode).toBe(200)
      })

      it('can handle non-API requests', async () => {
        await LegacyRequestLib.get('import', testPath, false)

        expect(RequestLib.get).toHaveBeenCalledWith(testPath, {
          prefixUrl: servicesConfig.import.url,
          headers: { authorization: `Bearer ${servicesConfig.legacyAuthToken}` },
          responseType: 'json'
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(() => {
        RequestLib.get.mockResolvedValue({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a `false` success status', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.response.body.message).toBe('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.response.statusCode).toBe(404)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequestLib.get('foobar', testPath)).rejects.toThrowError(
          'Request to unknown legacy service foobar'
        )
      })
    })
  })

  describe('#post()', () => {
    const requestBody = { name: 'water' }

    describe('when the request succeeds', () => {
      beforeEach(() => {
        RequestLib.post.mockResolvedValue({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(RequestLib.post).toHaveBeenCalledWith(testPath, {
          prefixUrl: `${servicesConfig.import.url}/import/1.0`,
          headers: { authorization: `Bearer ${servicesConfig.legacyAuthToken}` },
          responseType: 'json',
          json: requestBody
        })
      })

      it('returns a `true` success status', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.succeeded).toBe(true)
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.response.body.version).toBe('3.1.2')
        expect(result.response.body.commit).toBe('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.response.statusCode).toBe(200)
      })

      it('can handle non-API requests', async () => {
        await LegacyRequestLib.post('import', testPath, false, requestBody)

        expect(RequestLib.post).toHaveBeenCalledWith(testPath, {
          prefixUrl: servicesConfig.import.url,
          headers: { authorization: `Bearer ${servicesConfig.legacyAuthToken}` },
          responseType: 'json',
          json: requestBody
        })
      })
    })

    describe('when the request fails', () => {
      beforeEach(() => {
        RequestLib.post.mockResolvedValue({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a `false` success status', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error response', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.response.body.message).toBe('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.response.statusCode).toBe(404)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequestLib.post('foobar', testPath, true, requestBody)).rejects.toThrowError(
          'Request to unknown legacy service foobar'
        )
      })
    })
  })
})
