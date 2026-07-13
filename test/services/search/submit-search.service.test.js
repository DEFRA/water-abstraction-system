// Test framework dependencies

// Thing under test
import SubmitSearchService from '../../../app/services/search/submit-search.service.js'

const EXPECTED_ERROR = {
  errorList: [
    {
      href: '#query',
      text: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
    }
  ],
  query: {
    text: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
  }
}

describe('Search - Submit Search service', () => {
  let auth
  let payload
  let yar
  let yarSpy

  beforeEach(() => {
    auth = {
      credentials: {
        scope: ['billing']
      }
    }

    yarSpy = vi.fn()
    yar = { set: yarSpy }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a valid query', () => {
    beforeEach(() => {
      payload = { query: 'searchthis', resultType: 'monitoringStation' }
    })

    it('sets the session value and returns a redirect to the search results page', async () => {
      const result = await SubmitSearchService(auth, payload, yar)

      expect(yarSpy).toHaveBeenCalledWith('searchQuery', 'searchthis')
      expect(yarSpy).toHaveBeenCalledWith('searchResultType', 'monitoringStation')
      expect(result).toEqual({ redirect: '/system/search?page=1' })
    })
  })

  describe('when called without a valid query', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns an error message', async () => {
      const result = await SubmitSearchService(auth, payload, yar)

      expect(result).toEqual({
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
          },
          {
            checked: false,
            text: 'Licence holders',
            value: 'licenceHolder'
          },
          {
            checked: false,
            text: 'Licences',
            value: 'licence'
          },
          {
            checked: false,
            text: 'Monitoring stations',
            value: 'monitoringStation'
          },
          {
            checked: false,
            text: 'Return logs',
            value: 'returnLog'
          },
          {
            checked: false,
            text: 'Users',
            value: 'user'
          }
        ],
        error: EXPECTED_ERROR,
        pageTitle: 'Search',
        query: undefined,
        resultType: undefined,
        showResults: false
      })

      expect(yarSpy).not.toHaveBeenCalled()
    })
  })

  describe('when called to clear the filter', () => {
    beforeEach(() => {
      payload = { query: 'searchthis', resultType: 'monitoringStation', filter: 'clear' }
    })

    it('sets the session value and returns a redirect to the search results page', async () => {
      const result = await SubmitSearchService(auth, payload, yar)

      expect(yarSpy).toHaveBeenCalledWith('searchQuery', 'searchthis')
      expect(yarSpy).toHaveBeenCalledWith('searchResultType', 'all')
      expect(result).toEqual({ redirect: '/system/search?page=1' })
    })
  })

  describe('when called to apply the filter without a search query', () => {
    beforeEach(() => {
      payload = { query: '', resultType: 'monitoringStation', filter: 'apply' }
    })

    it('redirects to the blank search page without setting session values', async () => {
      const result = await SubmitSearchService(auth, payload, yar)

      expect(yarSpy).not.toHaveBeenCalled()
      expect(result).toEqual({ redirect: '/system/search' })
    })
  })

  describe('when called to clear the filter without a search query', () => {
    beforeEach(() => {
      payload = { query: '', resultType: 'monitoringStation', filter: 'clear' }
    })

    it('redirects to the blank search page without setting session values', async () => {
      const result = await SubmitSearchService(auth, payload, yar)

      expect(yarSpy).not.toHaveBeenCalled()
      expect(result).toEqual({ redirect: '/system/search' })
    })
  })
})
