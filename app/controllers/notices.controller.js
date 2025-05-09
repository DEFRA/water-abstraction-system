'use strict'

/**
 * Controller for /notices endpoints
 * @module NoticesController
 */

const NoticesIndexService = require('../services/notices/index.service.js')
const NoticesViewService = require('../services/notices/view.service.js')
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

async function view(request, h) {
  const {
    params: { id },
    query: { page = 1 }
  } = request

  const pageData = await NoticesViewService.go(id, page)

  return h.view(`${basePath}/view.njk`, pageData)
}

module.exports = {
  index,
  submitIndex,
  view
}
