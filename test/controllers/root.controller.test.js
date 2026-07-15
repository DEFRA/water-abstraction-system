// Test helpers
import http2 from 'node:http2'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_OK } = http2.constants

describe('Root controller: GET /', () => {
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  afterAll(async () => {
    await server.stop()
  })

  it('displays the correct message', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).toEqual(HTTP_STATUS_OK)
    expect(payload.status).toEqual('alive')
  })
})
