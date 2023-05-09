'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const TearDownService = require('../../../app/services/data/tear-down/tear-down.service.js')

// For running our service
const { init } = require('../../../app/server.js')

describe('Data controller: POST /data/tear-down', () => {
  let server

  afterEach(() => {
    Sinon.restore()
  })

  beforeEach(async () => {
    // Create server before each test
    server = await init()

    Sinon.stub(TearDownService, 'go').resolves()
  })

  it('returns a 204 status', async () => {
    const options = {
      method: 'POST',
      url: '/data/tear-down'
    }

    const response = await server.inject(options)

    expect(response.statusCode).to.equal(204)
  })
})
