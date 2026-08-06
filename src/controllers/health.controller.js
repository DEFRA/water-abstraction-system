/**
 * Controller for /health endpoints
 * @module HealthController
 */

import ViewInfoService from '../services/health/view-info.service.js'

export async function viewInfo(_request, h) {
  const pageData = await ViewInfoService()

  return h.view('health/info.njk', pageData)
}
