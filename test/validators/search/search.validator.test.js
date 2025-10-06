'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SearchValidator = require('../../../app/validators/search/search.validator.js')

describe('Search - Search validator', () => {
  let requestQuery

  describe('when a valid payload is provided', () => {
    describe('because the user provided a search term and page number', () => {
      beforeEach(() => {
        requestQuery = {
          query: 'This is a valid search term',
          page: '10'
        }
      })

      it('confirms the search is valid', () => {
        const result = SearchValidator.go(requestQuery)

        expect(result.error).not.to.exist()
        expect(result.value.query).to.equal('This is a valid search term')
        expect(result.value.page).to.equal(10)
      })
    })

    describe('because the user provided a search term without a page number', () => {
      beforeEach(() => {
        requestQuery = {
          query: 'This is a valid search term'
        }
      })

      it('uses the default page number 1', () => {
        const result = SearchValidator.go(requestQuery)

        expect(result.error).not.to.exist()
        expect(result.value.page).to.equal(1)
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user provided no search term', () => {
      beforeEach(() => {
        requestQuery = {}
      })

      it('fails validation with the error "Enter a licence number, customer name, returns ID, registered email address or monitoring station"', () => {
        const result = SearchValidator.go(requestQuery)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
          'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
        )
      })
    })

    describe('because the user provided a long search term', () => {
      beforeEach(() => {
        requestQuery = {
          query: 'a'.repeat(101)
        }
      })

      it('fails validation with the error "Search query must be 100 characters or less"', () => {
        const result = SearchValidator.go(requestQuery)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Search query must be 100 characters or less')
      })
    })

    describe('because the user provided a non-numeric page number', () => {
      beforeEach(() => {
        requestQuery = {
          query: 'This is a valid search term',
          page: 'not-a-number'
        }
      })

      it('fails validation with the error "Provide a valid page number"', () => {
        const result = SearchValidator.go(requestQuery)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Provide a valid page number')
      })
    })

    describe('because the user provided a large page number', () => {
      beforeEach(() => {
        requestQuery = {
          query: 'This is a valid search term',
          page: '11'
        }
      })

      it('fails validation with the error "Provide a valid page number"', () => {
        const result = SearchValidator.go(requestQuery)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Provide a valid page number')
      })
    })

    describe('because the user provided a negative page number', () => {
      beforeEach(() => {
        requestQuery = {
          query: 'This is a valid search term',
          page: '-1'
        }
      })

      it('fails validation with the error "Provide a valid page number"', () => {
        const result = SearchValidator.go(requestQuery)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Provide a valid page number')
      })
    })

    describe('because the user provided a decimal page number', () => {
      beforeEach(() => {
        requestQuery = {
          query: 'This is a valid search term',
          page: '1.5'
        }
      })

      it('fails validation with the error "Provide a valid page number"', () => {
        const result = SearchValidator.go(requestQuery)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Provide a valid page number')
      })
    })
  })
})
