'use strict'

/**
 * Controller for /notices endpoints
 * @module NoticesController
 */

const IndexNoticesService = require('../services/notices/index-notices.service.js')
const SubmitIndexNoticesService = require('../services/notices/submit-index-notices.service.js')
const SubmitViewNoticeService = require('../services/notices/submit-view-notice.service.js')
const ViewNoticeService = require('../services/notices/view-notice.service.js')

async function index(request, h) {
  const {
    auth,
    query: { page },
    yar
  } = request

  const pageData = await IndexNoticesService.go(yar, auth, page)

  return h.view('notices/index.njk', pageData)
}

async function submitIndex(request, h) {
  const {
    auth,
    payload,
    query: { page },
    yar
  } = request

  const pageData = await SubmitIndexNoticesService.go(payload, yar, auth, page)

  if (pageData.error) {
    return h.view('notices/index.njk', pageData)
  }

  return h.redirect('/system/notices')
}

async function submitView(request, h) {
  const { payload, yar } = request
  const { page } = request.query
  const { id } = request.params

  const pageData = await SubmitViewNoticeService.go(id, payload, yar, page)

  if (pageData.error) {
    return h.view('notices/view.njk', pageData)
  }

  return h.redirect(`/system/notices/${id}`)
}

async function view(request, h) {
  const {
    params: { id },
    query: { page = 1 },
    yar
  } = request

  const pageData = await ViewNoticeService.go(id, yar, page)

  return h.view('notices/view.njk', pageData)
}

module.exports = {
  index,
  submitIndex,
  submitView,
  view
}
