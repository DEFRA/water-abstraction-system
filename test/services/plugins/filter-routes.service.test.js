// Test framework dependencies
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
      expect(result).toEqual(routes)
    })
  })

  describe('when the environment is production', () => {
    it('returns the routes filtered', () => {
      const filteredRoutes = [...routes]
      filteredRoutes.pop()

      const result = FilterRoutesService.go(routes, 'prd')
      expect(result).toEqual(filteredRoutes)
    })
  })
})
