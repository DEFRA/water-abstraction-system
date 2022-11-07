'use strict'

class AirbrakeController {
  static async index (request, _h) {
    // First section tests connecting to Airbrake through a manual notification
    request.server.app.airbrake.notify({
      message: 'Airbrake manual health check',
      error: new Error('Airbrake manual health check error'),
      session: {
        req: {
          id: request.info.id
        }
      }
    })

    // Second section throws an error and checks that we automatically capture it and then connect to Airbrake
    throw new Error('Airbrake automatic health check error')
  }
}

module.exports = AirbrakeController
