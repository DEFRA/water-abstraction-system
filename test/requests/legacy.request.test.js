'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const servicesConfig = require('../../config/services.config.js')

// Things we need to stub
const BaseRequest = require('../../app/requests/base.request.js')

// Thing under test
const LegacyRequest = require('../../app/requests/legacy.request.js')

describe('Legacy Request', () => {
  const testPath = 'abstraction/info'

  afterEach(() => {
    Sinon.restore()
  })

  describe('#delete()', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'delete').resolves({
          succeeded: true,
          response: {
            statusCode: 204,
            body: {}
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequest.delete('import', testPath)

        const requestArgs = BaseRequest.delete.firstCall.args

        expect(requestArgs[0]).to.equal(testPath)
        expect(requestArgs[1].prefixUrl).to.equal(`${servicesConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).to.equal({ authorization: `Bearer ${servicesConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).to.equal('json')
      })

      it('returns a "true" success status', async () => {
        const result = await LegacyRequest.delete('import', testPath)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequest.delete('import', testPath)

        expect(result.response.body).to.equal({})
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.delete('import', testPath)

        expect(result.response.statusCode).to.equal(204)
      })

      it('can handle none API requests', async () => {
        await LegacyRequest.delete('import', testPath, null, false)

        const requestArgs = BaseRequest.delete.firstCall.args

        expect(requestArgs[1].prefixUrl).to.equal(servicesConfig.import.url)
      })

      it('can add the defra-user-id header', async () => {
        await LegacyRequest.delete('import', testPath, 1234, true)

        const requestArgs = BaseRequest.delete.firstCall.args

        expect(requestArgs[1].headers['defra-internal-user-id']).to.equal(1234)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'delete').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LegacyRequest.delete('import', testPath)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await LegacyRequest.delete('import', testPath)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.delete('import', testPath)

        expect(result.response.statusCode).to.equal(404)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequest.delete('foobar', testPath)).to.reject(
          Error,
          'Request to unknown legacy service foobar'
        )
      })
    })
  })

  describe('#get()', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequest.get('import', testPath)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[0]).to.equal(testPath)
        expect(requestArgs[1].prefixUrl).to.equal(`${servicesConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).to.equal({ authorization: `Bearer ${servicesConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).to.equal('json')
        expect(requestArgs[1].json).to.be.undefined()
      })

      it('returns a "true" success status', async () => {
        const result = await LegacyRequest.get('import', testPath)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequest.get('import', testPath)

        expect(result.response.body.version).to.equal('3.1.2')
        expect(result.response.body.commit).to.equal('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.get('import', testPath)

        expect(result.response.statusCode).to.equal(200)
      })

      it('can handle none API requests', async () => {
        await LegacyRequest.get('import', testPath, null, false)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[1].prefixUrl).to.equal(servicesConfig.import.url)
      })

      it('can add the defra-user-id header', async () => {
        await LegacyRequest.get('import', testPath, 1234, false)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[1].headers['defra-internal-user-id']).to.equal(1234)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LegacyRequest.get('import', testPath)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await LegacyRequest.get('import', testPath)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.get('import', testPath)

        expect(result.response.statusCode).to.equal(404)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequest.get('foobar', testPath)).to.reject(Error, 'Request to unknown legacy service foobar')
      })
    })
  })

  describe('#post()', () => {
    const requestBody = { name: 'water' }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'post').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequest.post('import', testPath, null, true, requestBody)

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[0]).to.equal(testPath)
        expect(requestArgs[1].prefixUrl).to.equal(`${servicesConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).to.equal({ authorization: `Bearer ${servicesConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).to.equal('json')
        expect(requestArgs[1].json).to.equal(requestBody)
      })

      it('returns a "true" success status', async () => {
        const result = await LegacyRequest.post('import', testPath, null, true, requestBody)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequest.post('import', testPath, null, true, requestBody)

        expect(result.response.body.version).to.equal('3.1.2')
        expect(result.response.body.commit).to.equal('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.post('import', testPath, null, true, requestBody)

        expect(result.response.statusCode).to.equal(200)
      })

      it('can handle none API requests', async () => {
        await LegacyRequest.post('import', testPath, null, false, requestBody)

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[1].prefixUrl).to.equal(servicesConfig.import.url)
      })

      it('can add the defra-user-id header', async () => {
        await LegacyRequest.post('import', testPath, 1234, false, requestBody)

        const requestArgs = BaseRequest.post.firstCall.args

        expect(requestArgs[1].headers['defra-internal-user-id']).to.equal(1234)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'post').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LegacyRequest.post('import', testPath, null, true, requestBody)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await LegacyRequest.post('import', testPath, null, true, requestBody)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequest.post('import', testPath, null, true, requestBody)

        expect(result.response.statusCode).to.equal(404)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequest.post('foobar', testPath, null, true, requestBody)).to.reject(
          Error,
          'Request to unknown legacy service foobar'
        )
      })
    })
  })
})
