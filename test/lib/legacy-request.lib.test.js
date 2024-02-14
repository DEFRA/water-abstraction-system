'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const servicesConfig = require('../../config/services.config.js')

// Things we need to stub
const RequestLib = require('../../app/lib/request.lib.js')

// Thing under test
const LegacyRequestLib = require('../../app/lib/legacy-request.lib.js')

describe('LegacyRequestLib', () => {
  const testPath = 'abstraction/info'

  afterEach(() => {
    Sinon.restore()
  })

  describe('#delete()', () => {
    const requestBody = { name: 'water' }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'delete').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequestLib.delete('import', testPath, true, requestBody)

        const requestArgs = RequestLib.delete.firstCall.args

        expect(requestArgs[0]).to.equal(testPath)
        expect(requestArgs[1].prefixUrl).to.equal(`${servicesConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).to.equal({ authorization: `Bearer ${servicesConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).to.equal('json')
        expect(requestArgs[1].json).to.equal(requestBody)
      })

      it('returns a `true` success status', async () => {
        const result = await LegacyRequestLib.delete('import', testPath, true, requestBody)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequestLib.delete('import', testPath, true, requestBody)

        expect(result.response.body.version).to.equal('3.1.2')
        expect(result.response.body.commit).to.equal('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.delete('import', testPath, true, requestBody)

        expect(result.response.statusCode).to.equal(200)
      })

      it('can handle none API requests', async () => {
        await LegacyRequestLib.delete('import', testPath, false, requestBody)

        const requestArgs = RequestLib.delete.firstCall.args

        expect(requestArgs[1].prefixUrl).to.equal(servicesConfig.import.url)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'delete').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            statusMessage: 'Not Found',
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          }
        })
      })

      it('returns a `false` success status', async () => {
        const result = await LegacyRequestLib.delete('import', testPath, true, requestBody)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await LegacyRequestLib.delete('import', testPath, true, requestBody)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.delete('import', testPath, true, requestBody)

        expect(result.response.statusCode).to.equal(404)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequestLib.delete('foobar', testPath, true, requestBody))
          .to
          .reject(Error, 'Request to unknown legacy service foobar')
      })
    })
  })

  describe('#get()', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'get').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequestLib.get('import', testPath)

        const requestArgs = RequestLib.get.firstCall.args

        expect(requestArgs[0]).to.equal(testPath)
        expect(requestArgs[1].prefixUrl).to.equal(`${servicesConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).to.equal({ authorization: `Bearer ${servicesConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).to.equal('json')
        expect(requestArgs[1].json).to.be.undefined()
      })

      it('returns a `true` success status', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.response.body.version).to.equal('3.1.2')
        expect(result.response.body.commit).to.equal('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.response.statusCode).to.equal(200)
      })

      it('can handle none API requests', async () => {
        await LegacyRequestLib.get('import', testPath, false)

        const requestArgs = RequestLib.get.firstCall.args

        expect(requestArgs[1].prefixUrl).to.equal(servicesConfig.import.url)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'get').resolves({
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

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.get('import', testPath)

        expect(result.response.statusCode).to.equal(404)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequestLib.get('foobar', testPath))
          .to
          .reject(Error, 'Request to unknown legacy service foobar')
      })
    })
  })

  describe('#post()', () => {
    const requestBody = { name: 'water' }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'post').resolves({
          succeeded: true,
          response: {
            statusCode: 200,
            body: { version: '3.1.2', commit: '70708cff586cc410c11af25cf8fd296f987d7f36' }
          }
        })
      })

      it('calls the legacy service with the required options', async () => {
        await LegacyRequestLib.post('import', testPath, true, requestBody)

        const requestArgs = RequestLib.post.firstCall.args

        expect(requestArgs[0]).to.equal(testPath)
        expect(requestArgs[1].prefixUrl).to.equal(`${servicesConfig.import.url}/import/1.0`)
        expect(requestArgs[1].headers).to.equal({ authorization: `Bearer ${servicesConfig.legacyAuthToken}` })
        expect(requestArgs[1].responseType).to.equal('json')
        expect(requestArgs[1].json).to.equal(requestBody)
      })

      it('returns a `true` success status', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.response.body.version).to.equal('3.1.2')
        expect(result.response.body.commit).to.equal('70708cff586cc410c11af25cf8fd296f987d7f36')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.response.statusCode).to.equal(200)
      })

      it('can handle none API requests', async () => {
        await LegacyRequestLib.post('import', testPath, false, requestBody)

        const requestArgs = RequestLib.post.firstCall.args

        expect(requestArgs[1].prefixUrl).to.equal(servicesConfig.import.url)
      })
    })

    describe('when the request fails', () => {
      beforeEach(async () => {
        Sinon.stub(RequestLib, 'post').resolves({
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

        expect(result.succeeded).to.be.false()
      })

      it('returns the error response', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.response.body.message).to.equal('Not Found')
      })

      it('returns the status code', async () => {
        const result = await LegacyRequestLib.post('import', testPath, true, requestBody)

        expect(result.response.statusCode).to.equal(404)
      })
    })

    describe('when the request is to an unknown legacy service', () => {
      it('throws an error', async () => {
        await expect(LegacyRequestLib.post('foobar', testPath, true, requestBody))
          .to
          .reject(Error, 'Request to unknown legacy service foobar')
      })
    })
  })
})
