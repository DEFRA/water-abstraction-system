'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Nock = require('nock')
const { gotWrapper } = require('../../app/lib/got-wrapper.lib.js')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const expect = Code.expect

describe('GotWrapperLib', () => {
  let request

  beforeEach(async () => {
    request = await gotWrapper()
  })

  afterEach(() => {
    Nock.cleanAll()
  })

  describe('when called with a string URL for a GET request', () => {
    beforeEach(() => {
      Nock('http://example.com').get('/get').reply(200, 'hello world')
    })

    it('calls back with response and body', async () => {
      const result = await wrapRequest(request, 'http://example.com/get')

      expect(result.res.statusCode).to.equal(200)
      expect(result.body).to.equal('hello world')
    })
  })

  describe('when called with an options object (eg. for a POST request)', () => {
    beforeEach(() => {
      Nock('http://example.com').post('/post', 'payload').reply(201, 'created')
    })

    it('calls back with response and body', async () => {
      const result = await wrapRequest(request, {
        url: 'http://example.com/post',
        method: 'POST',
        body: 'payload',
        headers: { 'content-type': 'text/plain' }
      })

      expect(result.res.statusCode).to.equal(201)
      expect(result.body).to.equal('created')
    })
  })

  describe('when an error occurs', () => {
    beforeEach(() => {
      Nock('http://example.com').get('/fail').reply(404)
    })

    it('calls back with error', async () => {
      const result = await wrapRequest(request, 'http://example.com/get')

      expect(result.err).to.exist()
      expect(result.res).to.be.null()
      expect(result.body).to.be.null()
    })
  })
})

// Helper to wrap request, which has Node-style (err, res, body) callback API, in a promise so it can be used with
// async/await. Note that we don't reject on an error as that results in an error being thrown, which we don't want as
// that just makes checking the response more of a pain in our tests.
function wrapRequest(request, opts) {
  return new Promise((resolve) => {
    request(opts, (err, res, body) => {
      if (err) {
        resolve({ err, res, body })
      }
      resolve({ res, body })
    })
  })
}
