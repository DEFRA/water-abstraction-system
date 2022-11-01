'use strict'

const routes = [
  {
    method: 'GET',
    path: '/test/supplementary',
    handler: () => { return 'hello' },
    options: {
      description: 'Test endpoint which returns all selected charge versions'
    }
  }
]

module.exports = routes
