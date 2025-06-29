'use strict'

/**
 * Controller for /reporting endpoints
 * @module ReportingController
 */

const DownloadReturnLogSubmissionsService = require('../services/reporting/download-return-log-submissions.service.js')
// const IndexReportingService = require('../services/reporting/index-reporting.service.js')

async function downloadReturnLogSubmissions(request, h) {
  const { data, type, filename } = await DownloadReturnLogSubmissionsService.go()

  return h
    .response(data)
    .type(type)
    .encoding('binary')
    .header('Content-Type', type)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
}

async function index(request, h) {
  // const pageData = await IndexReportingService.go(request.yar, page)
  const pageData = { pageTitle: 'Reporting' }

  return h.view('reporting/index.njk', pageData)
}

module.exports = {
  downloadReturnLogSubmissions,
  index
}
