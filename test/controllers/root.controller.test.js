'use strict'

const { HTTP_STATUS_OK } = require('node:http2').constants

// For running our service
const { init } = require('../../app/server.js')

describe('Root controller: GET /', () => {
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
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
