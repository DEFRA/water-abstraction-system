'use strict'

// Test framework dependencies
// Things we need to stub
const Boom = require('@hapi/boom')
const StartBillRunProcessService = require('../../app/services/billing/start-bill-run-process.service.js')
var sinon = require("sinon");

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
      }
    }
  }

  // Create server before each test
  beforeEach(async () => {
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    sinon.restore()
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
        sinon.stub(StartBillRunProcessService, 'go').resolves(validResponse)
      })

      it('returns a 200 response including details of the new bill run', async () => {
        const response = await server.inject(options())
        const payload = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(200)
        expect(payload).toEqual(validResponse)
      })
    })

    describe('when the request fails', () => {
      describe('because the request is invalid', () => {
        it('returns an error response', async () => {
          const response = await server.inject(options('INVALID'))
          const payload = JSON.parse(response.payload)

          expect(response.statusCode).toEqual(400)
          expect(payload.message).toMatch('"scheme" must be')
        })
      })

      describe('because the bill run could not be initiated', () => {
        beforeEach(async () => {
          sinon.stub(Boom, 'badImplementation').returns(new Boom.Boom('Bang', { statusCode: 500 }))
          sinon.stub(StartBillRunProcessService, 'go').rejects()
        })

        it('returns an error response', async () => {
          const response = await server.inject(options())
          const payload = JSON.parse(response.payload)

          expect(response.statusCode).toEqual(500)
          expect(payload.message).toEqual('An internal server error occurred')
        })
      })
    })
  })
})
