'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs controller:', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
  })

  describe('POST /bill-runs', () => {
    it('returns a dummy response', async () => {
      const options = {
        method: 'POST',
        url: '/bill-runs'
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)
      expect(payload.test).to.equal('ok')
    })
  })
})
