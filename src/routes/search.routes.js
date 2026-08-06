import { submitSearch, viewSearch } from '../controllers/search.controller.js'

export default [
  {
    method: 'GET',
    path: '/search',
    options: {
      handler: viewSearch
    }
  },
  {
    method: 'POST',
    path: '/search',
    options: {
      handler: submitSearch
    }
  }
]
