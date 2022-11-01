'use strict'

const TestSupplementaryService = require('../../services/test/supplementary.service.js')

class TestSupplementaryController {
  static async index (_req, h) {
    const result = await TestSupplementaryService.go()

    return h.response(result).code(200)
  }
}

module.exports = TestSupplementaryController
