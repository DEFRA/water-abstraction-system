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
    describe('when a valid request is sent', () => {
      it('returns a dummy response', async () => {
        const options = {
          method: 'POST',
          url: '/bill-runs',
          payload: {
            type: 'supplementary',
            scheme: 'sroc'
          }
        }

        const response = await server.inject(options)
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload.type).to.equal('supplementary')
      })
    })

    describe('when an invvalid request is sent', () => {
      it('returns an error response', async () => {
        const options = {
          method: 'POST',
          url: '/bill-runs',
          payload: {
            type: 'supplementary',
            scheme: 'INVALID'
          }
        }

        const response = await server.inject(options)

        expect(response.statusCode).to.equal(400)
      })
    })
  })
})
