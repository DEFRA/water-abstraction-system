'use strict'

// Test framework dependencies

const Hoek = require('@hapi/hoek')

// Thing under test
const FilterRoutesService = require('../../../app/services/plugins/filter-routes.service.js')

describe('Filter routes service', () => {
  const routes = [
    { path: '/' },
    { path: '/admin' },
    {
      path: '/path-to-be-filtered',
      options: { app: { excludeFromProd: true } }
    }
  ]

  describe('when the environment is non-production', () => {
    it('returns the routes unchanged', () => {
      const result = FilterRoutesService(routes, 'dev')

      expect(result).toEqual(routes)
    })
  })

  describe('when the environment is production', () => {
    it('returns the routes filtered', () => {
      const filteredRoutes = Hoek.clone(routes)

      filteredRoutes.pop()

      const result = FilterRoutesService(routes, 'prd')

      expect(result).toEqual(filteredRoutes)
    })
  })
})
