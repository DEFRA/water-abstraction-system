'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

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
      const result = FilterRoutesService.go(routes, 'dev')

      expect(result).to.equal(routes)
    })
  })

  describe('when the environment is production', () => {
    it('returns the routes filtered', () => {
      const filteredRoutes = Hoek.clone(routes)

      filteredRoutes.pop()

      const result = FilterRoutesService.go(routes, 'prd')

      expect(result).to.equal(filteredRoutes)
    })
  })
})
