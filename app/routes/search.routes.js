'use strict'

const SearchController = require('../controllers/search.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/search',
    options: {
      handler: SearchController.viewSearch
    }
  },
  {
    method: 'POST',
    path: '/search',
    options: {
      handler: SearchController.submitSearch
    }
  }
]

module.exports = routes
