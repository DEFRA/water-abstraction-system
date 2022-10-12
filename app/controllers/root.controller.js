'use strict'

class RootController {
  static async index (_req, _h) {
    return { status: 'alive' }
  }

  static async helloWorld (_req, h) {
    return h.view('home.njk', {
      title: 'Hello',
      message: 'World',
      pageTitle: 'Hello World!'
    })
  }
}

module.exports = RootController
