'use strict'

const { HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

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

    expect(response.statusCode).to.equal(HTTP_STATUS_OK)
    expect(payload.status).to.equal('alive')
  })
})
