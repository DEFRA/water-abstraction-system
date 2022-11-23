'use strict'

/**
 * Controller for /health/database endpoints
 * @module DatabaseController
 */

const DatabaseHealthCheckService = require('../../services/database-health-check.service.js')

class DatabaseController {
  static async index (_request, h) {
    const result = await DatabaseHealthCheckService.go()

    return h.response(result).code(200)
  }
}

module.exports = DatabaseController
