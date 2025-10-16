'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SearchValidator = require('../../../app/validators/search/search.validator.js')

describe('Search - Search validator', () => {
  let payload

  describe('when a valid payload is provided', () => {
    describe('because the user provided a search term and page number', () => {
      beforeEach(() => {
        payload = { query: 'This is a valid search term' }
      })

      it('confirms the search is valid', () => {
        const result = SearchValidator.go(payload)

        expect(result.error).to.not.exist()
        expect(result.value.query).to.equal('This is a valid search term')
      })
    })
  })

  describe('when an invalid payload is provided', () => {
    describe('because the user provided no search term', () => {
      beforeEach(() => {
        payload = {}
      })

      it('fails validation with the error "Enter a licence number, customer name, returns ID, registered email address or monitoring station"', () => {
        const result = SearchValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal(
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
        const result = SearchValidator.go(payload)

        expect(result.error).to.exist()
        expect(result.error.details[0].message).to.equal('Search query must be 100 characters or less')
      })
    })
  })
})
