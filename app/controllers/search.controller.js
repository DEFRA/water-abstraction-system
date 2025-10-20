'use strict'

/**
 * Controller for /search endpoints
 * @module SearchController
 */

const SubmitSearchService = require('../services/search/submit-search.service.js')
const ViewSearchResultsService = require('../services/search/view-search-results.service.js')
const ViewSearchService = require('../services/search/view-search.service.js')

const VIEW_PAGE = 'search/search.njk'

async function submitSearch(request, h) {
  const { payload, yar } = request

  const submitResult = await SubmitSearchService.go(payload, yar)

  if (submitResult.error) {
    return h.view(VIEW_PAGE, submitResult)
  }

  const { redirect } = submitResult

  return h.redirect(redirect)
}

async function viewSearch(request, h) {
  const {
    query: { page },
    yar
  } = request

  const searchQuery = yar.get('searchQuery')

  // GET requests sent to the /search page might be either to just show the search page or to view search results, so we
  // need to check whether this is just an initial request to display the page (i.e. no page parameter is present) or
  // whether it is a request for a page of results
  if (!page) {
    const viewPageData = await ViewSearchService.go()

    return h.view(VIEW_PAGE, viewPageData)
  }

  const pageData = await ViewSearchResultsService.go(searchQuery, page)

  return h.view(VIEW_PAGE, pageData)
}

module.exports = {
  submitSearch,
  viewSearch
}
