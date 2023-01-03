'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const InitiateBillingBatchService = require('../../../app/services/supplementary-billing/initiate-billing-batch.service.js')

// For running our service
const { init } = require('../../../app/server.js')

describe('Bill Runs controller', () => {
  let server

  function options (scheme = 'sroc') {
    return {
      method: 'POST',
      url: '/bill-runs',
      payload: {
        type: 'supplementary',
        scheme,
        region: '07ae7f3a-2677-4102-b352-cc006828948c',
        user: 'test.user@defra.gov.uk'
      }
    }
  }

  // Create server before each test
  beforeEach(async () => {
    server = await init()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('POST /bill-runs', () => {
    describe('when a request is valid', () => {
      const validResponse = {
        id: 'f561990b-b29a-42f4-b71a-398c52339f78',
        region: '07ae7f3a-2677-4102-b352-cc006828948c',
        scheme: 'sroc',
        batchType: 'supplementary',
        status: 'processing'
      }

      beforeEach(async () => {
        Sinon.stub(InitiateBillingBatchService, 'go').resolves(validResponse)
      })

      it('returns a 200 response including details of the new billing batch', async () => {
        const response = await server.inject(options())
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload).to.equal(validResponse)
      })
    })

    describe('when the request is invalid', () => {
      it('returns an error response', async () => {
        const response = await server.inject(options('INVALID'))
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(400)
        expect(payload.message).to.startWith('"scheme" must be')
      })
    })
  })
})
