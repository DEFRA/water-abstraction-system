'use strict'

// Thing under test
const SearchValidator = require('../../../app/validators/search/search.validator.js')

describe('Search - Search validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user provided a search term', () => {
      beforeEach(() => {
        payload = { query: 'This is a valid search term' }
      })

      it('confirms the search is valid', () => {
        const result = SearchValidator(payload)

        expect(result.error).toBeUndefined()
        expect(result.value.query).toEqual('This is a valid search term')
      })
    })

    describe('because the user clicked a filter button but did not provide a search term', () => {
      beforeEach(() => {
        payload = { filter: 'apply' }
      })

      it('confirms the search is valid', () => {
        const result = SearchValidator(payload)

        expect(result.error).toBeUndefined()
        expect(result.value.query).toBeUndefined()
      })
    })

    describe('because the user clicked a filter button but provided an empty search term', () => {
      beforeEach(() => {
        payload = { filter: 'clear', query: '' }
      })

      it('confirms the search is valid', () => {
        const result = SearchValidator(payload)

        expect(result.error).toBeUndefined()
        expect(result.value.query).toEqual('')
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user provided no search term', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the error "Enter a licence number, customer name, returns ID, registered email address or monitoring station"', () => {
        const result = SearchValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual(
          'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
        )
      })
    })

    describe('because the user provided a long search term', () => {
      beforeEach(() => {
        payload = {
          query: 'a'.repeat(101)
        }
      })

      it('fails validation with the error "Search query must be 100 characters or less"', () => {
        const result = SearchValidator(payload)

        expect(result.error).toBeDefined()
        expect(result.error.details[0].message).toEqual('Search query must be 100 characters or less')
      })
    })
  })
})
