'use strict'

/**
 * Controller for /reporting endpoints
 * @module ReportingController
 */

// const IndexReportingService = require('../services/reporting/index-reporting.service.js')

async function index(request, h) {
  // const pageData = await IndexReportingService.go(request.yar, page)
  const pageData = { pageTitle: 'Reporting' }

  return h.view('reporting/index.njk', pageData)
}

module.exports = {
  index
}
