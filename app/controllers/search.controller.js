'use strict'

/**
 * Controller for /search endpoints
 * @module SearchController
 */

const ViewSearchService = require('../services/search/view-search.service.js')
const SubmitSearchService = require('../services/search/submit-search.service.js')

async function search(request, h) {
  const { query } = request

  // All requests to the /search page are submitted as GET requests, so we need to check whether this is just an
  // initial request to display the page (i.e. no query parameter present) or whether it is a search request
  if (!('query' in query)) {
    const pageData = await ViewSearchService.go()

    return h.view('search/search.njk', pageData)
  }

  // If there is a query, process the search
  const pageData = await SubmitSearchService.go(query)

  return h.view('search/search.njk', pageData)
}

module.exports = {
  search
}
