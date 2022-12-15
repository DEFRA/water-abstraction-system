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
            scheme: 'sroc',
            region: '07ae7f3a-2677-4102-b352-cc006828948c'
          }
        }

        const response = await server.inject(options)
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload.batchType).to.equal('supplementary')
      })
    })

    describe('when an invalid request is sent', () => {
      it('returns an error response', async () => {
        const options = {
          method: 'POST',
          url: '/bill-runs',
          payload: {
            type: 'supplementary',
            scheme: 'INVALID',
            region: '07ae7f3a-2677-4102-b352-cc006828948c'
          }
        }

        const response = await server.inject(options)
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(400)
        expect(payload.message).to.startWith('"scheme" must be')
      })
    })
  })
})
