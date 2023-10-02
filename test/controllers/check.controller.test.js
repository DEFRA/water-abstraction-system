'use strict'

// Test framework dependencies
// Things we need to stub
const TwoPartService = require('../../app/services/check/two-part.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Check controller', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    server.logger.error = jest.fn().mockResolvedValue()

    // We silence sending a notification to our Errbit instance using Airbrake
    server.app.airbrake.notify = jest.fn().mockResolvedValue()
  })
  describe('GET /check/two-part', () => {
    const options = {
      method: 'GET',
      url: '/check/two-part/9'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        jest.spyOn(TwoPartService, 'go').mockResolvedValue({ regionName: 'Fantasia' })
      })

      it('displays the correct message', async () => {
        const response = await server.inject(options)

        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).toEqual(200)
        expect(responsePayload).toEqual({ regionName: 'Fantasia' })
      })
    })

    describe('when the request fails', () => {
      describe('because the TwoPartService errors', () => {
        beforeEach(async () => {
          jest.spyOn(TwoPartService, 'go').mockRejectedValue()
        })

        it('returns a 500 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(500)
        })
      })
    })
  })
})
