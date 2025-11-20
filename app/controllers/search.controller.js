'use strict'

/**
 * Controller for /search endpoints
 * @module SearchController
 */

const SubmitSearchService = require('../services/search/submit-search.service.js')
const ViewSearchService = require('../services/search/view-search.service.js')

const VIEW_PAGE = 'search/search.njk'

async function submitSearch(request, h) {
  const { auth, payload, yar } = request

  const submitResult = await SubmitSearchService.go(auth, payload, yar)

  if (submitResult.error) {
    return h.view(VIEW_PAGE, submitResult)
  }

  const { redirect } = submitResult

  return h.redirect(redirect)
}

async function viewSearch(request, h) {
  const {
    auth,
    query: { page },
    yar
  } = request

  const pageData = await ViewSearchService.go(auth, yar, page)

  return h.view(VIEW_PAGE, pageData)
}

module.exports = {
  submitSearch,
  viewSearch
}
