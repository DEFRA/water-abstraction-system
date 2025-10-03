'use strict'

const SearchController = require('../controllers/search.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/search',
    options: {
      handler: SearchController.search
    }
  }
]

module.exports = routes
