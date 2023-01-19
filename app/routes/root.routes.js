'use strict'

const RootController = require('../controllers/root.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: RootController.index,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/robots.txt',
    handler: {
      file: 'app/public/static/robots.txt'
    }
  },
  {
    method: 'GET',
    path: '/status',
    handler: RootController.index,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/token/get',
    handler: RootController.get,
    options: {
      auth: false
    }
  }
]

module.exports = routes
