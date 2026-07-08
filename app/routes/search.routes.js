import { submitSearch, viewSearch } from '../controllers/search.controller.js'

const routes = [
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

export default routes
