'use strict'

const SupplementaryService = require('../../services/test/supplementary.service.js')

class SupplementaryController {
  static async index (_request, h) {
    const result = await SupplementaryService.go()

    return h.response(result).code(200)
  }
}

module.exports = SupplementaryController
