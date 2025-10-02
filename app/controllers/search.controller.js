'use strict'

/**
 * Controller for /search endpoints
 * @module SearchController
 */

const ViewSearchService = require('../services/search/view-search.service.js')
const QuerySearchService = require('../services/search/query-search.service.js')

async function search(request, h) {
  const { query, page = 1 } = request.query

  // All requests to the /search page are submitted as GET requests, so we need to check whether this is just an
  // initial request to display the page (i.e. no query parameter present) or whether it is a search request
  if (!('query' in request.query)) {
    const pageData = await ViewSearchService.go()

    return h.view('search/search.njk', pageData)
  }

  // If there is a query, process the search
  const pageData = await QuerySearchService.go(query, page)

  return h.view('search/search.njk', pageData)
}

module.exports = {
  search
}
