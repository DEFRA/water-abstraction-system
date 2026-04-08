'use strict'

/**
 * Controller for /return-logs endpoints
 * @module ReturnLogsController
 */

const DownloadReturnLogService = require('../services/return-logs/download-return-log.service.js')
const SubmitDetailsService = require('../services/return-logs/submit-details.service.js')
const ViewCommunicationsService = require('../services/return-logs/view-communications.service.js')
const ViewDetailsService = require('../services/return-logs/view-details.service.js')

async function download(request, h) {
  const {
    params: { id },
    query
  } = request

  const version = Number(query.version)

  const { data, type, filename } = await DownloadReturnLogService.go(id, version)

  return h
    .response(data)
    .type(type)
    .encoding('binary')
    .header('Content-Type', type)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
}

async function viewCommunications(request, h) {
  const {
    params: { id },
    query: { page }
  } = request

  const pageData = await ViewCommunicationsService.go(id, page)

  return h.view('return-logs/communications.njk', pageData)
}

async function viewDetails(request, h) {
  const {
    auth,
    params: { id },
    query
  } = request

  const version = query.version ? Number(query.version) : 0

  const pageData = await ViewDetailsService.go(id, auth, version)

  return h.view('return-logs/details.njk', pageData)
}

async function submitDetails(request, h) {
  const { id } = request.params

  await SubmitDetailsService.go(request.payload, id)

  return h.redirect(`/system/return-logs/${id}/details`)
}

module.exports = {
  download,
  submitDetails,
  viewCommunications,
  viewDetails
}
