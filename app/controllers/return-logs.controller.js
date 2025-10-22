'use strict'

/**
 * Controller for /return-logs endpoints
 * @module ReturnLogsController
 */

const DownloadReturnLogService = require('../services/return-logs/download-return-log.service.js')
const SubmitViewReturnLogService = require('../services/return-logs/submit-view-return-log.service.js')
const ViewReturnLogService = require('../services/return-logs/view-return-log.service.js')

async function download(request, h) {
  const {
    params: { returnId },
    query
  } = request

  const version = Number(query.version)

  const { data, type, filename } = await DownloadReturnLogService.go(returnId, version)

  return h
    .response(data)
    .type(type)
    .encoding('binary')
    .header('Content-Type', type)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
}

async function view(request, h) {
  const {
    auth,
    params: { returnId },
    query
  } = request

  const version = query.version ? Number(query.version) : 0

  const pageData = await ViewReturnLogService.go(auth, returnId, version)

  return h.view('return-logs/view.njk', pageData)
}

async function submitView(request, h) {
  const { returnId } = request.params

  await SubmitViewReturnLogService.go(returnId, request.payload)

  return h.redirect(`/system/return-logs/${returnId}`)
}

module.exports = {
  download,
  submitView,
  view
}
