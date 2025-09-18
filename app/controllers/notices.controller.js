'use strict'

/**
 * Controller for /notices endpoints
 * @module NoticesController
 */

const IndexNoticesService = require('../services/notices/index-notices.service.js')
const NoticesViewService = require('../services/notices/view.service.js')
const SubmitIndexNoticesService = require('../services/notices/submit-index-notices.service.js')

async function index(request, h) {
  const { page } = request.query

  const pageData = await IndexNoticesService.go(request.yar, page)

  return h.view('notices/index.njk', pageData)
}

async function submitIndex(request, h) {
  const { payload, yar } = request
  const { page } = request.query

  const pageData = await SubmitIndexNoticesService.go(payload, yar, page)

  if (pageData.error) {
    return h.view('notices/index.njk', pageData)
  }

  return h.redirect('/system/notices')
}

async function view(request, h) {
  const {
    params: { id },
    query: { page = 1 }
  } = request

  const pageData = await NoticesViewService.go(id, page)

  return h.view('notices/view.njk', pageData)
}

module.exports = {
  index,
  submitIndex,
  view
}
