/**
 * Controller for /search endpoints
 * @module SearchController
 */

import SubmitSearchService from '../services/search/submit-search.service.js'
import ViewSearchService from '../services/search/view-search.service.js'

const VIEW_PAGE = 'search/search.njk'

export async function submitSearch(request, h) {
  const { auth, payload, yar } = request

  const submitResult = await SubmitSearchService(auth, payload, yar)

  if (submitResult.error) {
    return h.view(VIEW_PAGE, submitResult)
  }

  const { redirect } = submitResult

  return h.redirect(redirect)
}

export async function viewSearch(request, h) {
  const {
    auth,
    query: { page },
    yar
  } = request

  const pageData = await ViewSearchService(auth, yar, page)

  return h.view(VIEW_PAGE, pageData)
}
