'use strict'

/**
 * Controller for /notices endpoints
 * @module NoticesController
 */

const NoticesIndexService = require('../services/notices/index.service.js')
const SubmitNoticesIndexService = require('../services/notices/submit-index.service.js')

const basePath = 'notices'

async function index(request, h) {
  const {
    query: { page = 1 }
  } = request

  const pageData = await NoticesIndexService.go(request.yar, page)

  return h.view(`${basePath}/index.njk`, pageData)
}

async function submitIndex(request, h) {
  await SubmitNoticesIndexService.go(request.payload, request.yar)

  return h.redirect('/system/notices')
}

module.exports = {
  index,
  submitIndex
}
