'use strict'

/**
 * Controller for /return-logs endpoints
 * @module ReturnLogsController
 */

const Boom = require('@hapi/boom')

const DownloadReturnLogService = require('../services/return-logs/download-return-log.service.js')
const SubmitViewReturnLogService = require('../services/return-logs/submit-view-return-log.service.js')
const ViewReturnLogService = require('../services/return-logs/view-return-log.service.js')

async function download(request, h) {
  const { query } = request

  const version = query.version ? Number(query.version) : 0

  const { data, type, filename } = await DownloadReturnLogService.go(query.id, version)

  return h
    .response(data)
    .type(type)
    .encoding('binary')
    .header('Content-Type', type)
    .header('Content-Disposition', `attachment; filename="${filename}"`)
}

async function view(request, h) {
  const { auth, query } = request

  if (!query.id) {
    return Boom.badImplementation('Id is required')
  }

  const version = query.version ? Number(query.version) : 0

  const pageData = await ViewReturnLogService.go(query.id, version, auth)

  return h.view('return-logs/view.njk', pageData)
}

async function submitView(request, h) {
  const { id } = request.query

  await SubmitViewReturnLogService.go(id, request.payload)

  return h.redirect(`/system/return-logs?id=${id}`)
}

module.exports = {
  download,
  submitView,
  view
}
