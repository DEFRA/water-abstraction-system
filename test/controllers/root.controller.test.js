'use strict'

// Test framework dependencies
const { describe, it, before } = require('node:test')
const { expect } = require('@hapi/code')

// For running our service
const { init } = require('../../app/server.js')

describe('Root controller: GET /', () => {
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  it('displays the correct message', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    const payload = JSON.parse(response.payload)

    expect(response.statusCode).to.equal(200)
    expect(payload.status).to.equal('alive')
  })
})
