/**
 * Controller for /notices endpoints
 * @module NoticesController
 */

import IndexNoticesService from '../services/notices/index-notices.service.js'
import SubmitIndexNoticesService from '../services/notices/submit-index-notices.service.js'
import SubmitViewNoticeService from '../services/notices/submit-view-notice.service.js'
import ViewNoticeService from '../services/notices/view-notice.service.js'

export async function index(request, h) {
  const {
    auth,
    query: { page },
    yar
  } = request

  const pageData = await IndexNoticesService.go(yar, auth, page)

  return h.view('notices/index.njk', pageData)
}

export async function submitIndex(request, h) {
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

export async function submitView(request, h) {
  const { payload, yar } = request
  const { page } = request.query
  const { id } = request.params

  const pageData = await SubmitViewNoticeService.go(id, payload, yar, page)

  if (pageData.error) {
    return h.view('notices/view.njk', pageData)
  }

  return h.redirect(`/system/notices/${id}`)
}

export async function view(request, h) {
  const {
    params: { id },
    query: { page },
    yar
  } = request

  const pageData = await ViewNoticeService.go(id, yar, page)

  return h.view('notices/view.njk', pageData)
}
