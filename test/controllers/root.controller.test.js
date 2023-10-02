'use strict'

// For running our service
const { init } = require('../../app/server.js')

describe('Root controller: GET /', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
  })

  it('displays the correct message', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).toEqual(200)
    expect(payload.status).toEqual('alive')
  })
})
