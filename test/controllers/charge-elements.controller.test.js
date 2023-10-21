'use strict'

// Things we need to stub
const ProcessTimeLimitedLicencesService = require('../../app/services/charge-elements/process-time-limited-licences.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Charge Elements controller', () => {
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

  describe('POST /charge-elements/time-limited', () => {
    const options = {
      method: 'POST',
      url: '/charge-elements/time-limited'
    }

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        jest.spyOn(ProcessTimeLimitedLicencesService, 'go').mockResolvedValue()
      })

      it('displays the correct message', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).toEqual(204)
      })
    })
  })
})
