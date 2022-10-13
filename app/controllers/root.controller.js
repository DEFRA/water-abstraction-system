'use strict'

class RootController {
  static async index (_req, _h) {
    return { status: 'alive' }
  }

  static helloWorld (_req, h) {
    return h.view('home.njk', {
      title: 'Hello',
      message: 'World',
      pageTitle: 'Hello World!'
    })
  }

  static serviceStatus (_req, h) {
    const importRows = [
      [
        {
          text: 'First 6 weeks'
        },
        {
          text: '£109.80 per week'
        },
        {
          text: 'First 6 weeks'
        },
        {
          text: 'First 6 weeks'
        },
        {
          text: 'First 6 weeks'
        }
      ]
    ]
    return h.view('service_status.njk', {
      pageTitle: 'Service Status',
      importRows
    })
  }
}

module.exports = RootController
