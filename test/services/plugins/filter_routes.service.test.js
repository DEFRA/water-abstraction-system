// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Hoek from '@hapi/hoek'

// Thing under test
import FilterRoutesService from '../../../app/services/plugins/filter_routes.service.js'

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

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
