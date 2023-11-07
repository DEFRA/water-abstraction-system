'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const Boom = require('@hapi/boom')
const StartBillRunProcessService = require('../../app/services/billing/start-bill-run-process.service.js')

// For running our service
const { init } = require('../../app/server.js')

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
      },
      auth: {
        strategy: 'session',
        credentials: { scope: ['billing'] }
      }
    }
  }

  // Create server before each test
  beforeEach(async () => {
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
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
        Sinon.stub(StartBillRunProcessService, 'go').resolves(validResponse)
      })

      it('returns a 200 response including details of the new bill run', async () => {
        const response = await server.inject(options())
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(payload).to.equal(validResponse)
      })
    })

    describe('when the request fails', () => {
      describe('because the request is invalid', () => {
        it('returns an error response', async () => {
          const response = await server.inject(options('INVALID'))
          const payload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(400)
          expect(payload.message).to.startWith('"scheme" must be')
        })
      })

      describe('because the bill run could not be initiated', () => {
        beforeEach(async () => {
          Sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
          Sinon.stub(StartBillRunProcessService, 'go').rejects()
        })

        it('returns an error response', async () => {
          const response = await server.inject(options())
          const payload = JSON.parse(response.payload)

          expect(response.statusCode).to.equal(500)
          expect(payload.message).to.equal('An internal server error occurred')
        })
      })
    })
  })

  describe('GET /bill-runs/{id}/review', () => {
    let options

    beforeEach(async () => {
      options = {
        method: 'POST',
        url: '/charge-elements/time-limited'
      }
    })

    describe('when a request is valid', () => {
      it('returns a 200 response', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(204)
      })
    })
  })
})
