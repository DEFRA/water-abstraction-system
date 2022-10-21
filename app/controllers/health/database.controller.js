import DatabaseHealthCheckService from '../../services/database_health_check.service.js'

class DatabaseController {
  static async index (_req, h) {
    const result = await DatabaseHealthCheckService.go()

    return h.response(result).code(200)
  }
}

export default DatabaseController
