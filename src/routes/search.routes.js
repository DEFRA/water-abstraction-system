/**
 * Routes for the /search endpoints
 *
 * @module SearchRoutes
 */

import { submitSearch, viewSearch } from '../controllers/search.controller.js'

export default [
  {
    method: 'GET',
    options: {
      handler: viewSearch
    },
    path: '/search'
  },
  {
    method: 'POST',
    options: {
      handler: submitSearch
    },
    path: '/search'
  }
]
