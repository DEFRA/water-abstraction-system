import http2 from 'node:http2'

// Test framework dependencies
import Nock from 'nock'

// Thing under test
import { gotWrapper } from '../../app/lib/got-wrapper.lib.js'
const { HTTP_STATUS_CREATED, HTTP_STATUS_OK } = http2.constants

describe('GotWrapperLib', () => {
  let request

  beforeEach(async () => {
    if (!Nock.isActive()) {
      Nock.activate()
    }

    request = await gotWrapper()
  })

  afterEach(() => {
    Nock.cleanAll()
    Nock.restore()
  })

  describe('when called with a string URL for a GET request', () => {
    beforeEach(() => {
      Nock('http://example.com').get('/get').reply(200, 'hello world')
    })

    it('calls back with response and body', async () => {
      const result = await wrapRequest(request, 'http://example.com/get')

      expect(result.res.statusCode).toEqual(HTTP_STATUS_OK)
      expect(result.body).toEqual('hello world')
    })
  })

  describe('when called with an options object (eg. for a POST request)', () => {
    beforeEach(() => {
      Nock('http://example.com').post('/post', 'payload').reply(201, 'created', { 'content-length': '7' })
    })

    it('calls back with response and body', async () => {
      const result = await wrapRequest(request, {
        url: 'http://example.com/post',
        method: 'POST',
        body: 'payload',
        headers: { 'content-type': 'text/plain' }
      })

      expect(result.res.statusCode).toEqual(HTTP_STATUS_CREATED)
      expect(result.body).toEqual('created')
    })
  })

  describe('when an error occurs', () => {
    beforeEach(() => {
      Nock('http://example.com').get('/fail').reply(500)
    })

    it('calls back with error', async () => {
      const result = await wrapRequest(request, 'http://example.com/get')

      expect(result.err).toBeDefined()
      expect(result.res).toBeNull()
      expect(result.body).toBeNull()
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
      } else {
        resolve({ res, body })
      }
    })
  })
}
