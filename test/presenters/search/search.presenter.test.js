'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SearchPresenter = require('../../../app/presenters/search/search.presenter.js')

describe('Search - Search presenter', () => {
  let licences
  let numberOfPages
  let page
  let query
  let returnLogs

  beforeEach(() => {
    query = 'searchthis'
    numberOfPages = 1
    page = 1

    licences = [
      {
        $ends: () => {
          return null
        },
        id: 'licence-1',
        licenceRef: '01/123',
        metadata: {
          Initials: 'F',
          Name: 'Surname',
          Salutation: 'Mr'
        }
      }
    ]

    returnLogs = [
      {
        id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
        licenceRef: '01/123',
        returnReference: '123',
        regionDisplayName: 'Region',
        naldRegionId: 1,
        status: 'completed'
      }
    ]
  })

  describe('when provided with a valid query that returns results', () => {
    it('correctly presents the data', () => {
      const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

      expect(result).to.equal({
        licences: [
          {
            id: 'licence-1',
            licenceEndDate: null,
            licenceEndedText: null,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '01/123'
          }
        ],
        noResults: false,
        page: 1,
        pageTitle: 'Search results',
        query: 'searchthis',
        returnLogs: [
          {
            id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
            licenceRef: '01/123',
            returnReference: '123',
            regionDisplayName: 'Region',
            statusText: 'complete'
          }
        ],
        showResults: true
      })
    })
  })

  describe('the "licences" property', () => {
    describe('when no matching licences have been found', () => {
      beforeEach(() => {
        licences = null
      })

      it('returns "null"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.licences).to.be.null()
      })
    })

    describe('when some matching licences have been found', () => {
      it('returns an array', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.licences[0]).to.exist()
        expect(result.licences.length).to.equal(1)
      })
    })

    describe('the "licenceEndedText" property', () => {
      describe('when a licence has an end date in the past', () => {
        beforeEach(() => {
          licences[0].$ends = () => {
            return {
              date: new Date('2020-12-31'),
              reason: 'revoked'
            }
          }
        })

        it('returns the `reason` value', () => {
          const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

          expect(result.licences[0].licenceEndedText).to.equal('revoked')
        })
      })

      describe('when a licence has an end date in the future', () => {
        beforeEach(() => {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)

          licences[0].$ends = () => {
            return {
              date: tomorrow,
              reason: 'expired'
            }
          }
        })

        it('returns an empty value', () => {
          const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

          expect(result.licences[0].licenceEndedText).to.not.exist()
        })
      })
    })
  })

  describe('the "noResults" property', () => {
    describe('when neither licences nor return logs have results', () => {
      beforeEach(() => {
        licences = null
        returnLogs = null
      })

      it('returns "true"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.noResults).to.be.true()
      })
    })

    describe('when there were only licence results', () => {
      beforeEach(() => {
        returnLogs = null
      })

      it('returns "false"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.noResults).to.be.false()
      })
    })

    describe('when there were only return log results', () => {
      beforeEach(() => {
        licences = null
      })

      it('returns "false"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.noResults).to.be.false()
      })
    })

    describe('when both licences and return logs have results', () => {
      it('returns "false"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.noResults).to.be.false()
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when the blank search page is shown', () => {
      beforeEach(() => {
        licences = undefined
        numberOfPages = undefined
        page = undefined
        query = undefined
        returnLogs = undefined
      })

      it('returns "Search"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.pageTitle).to.equal('Search')
      })
    })

    describe('when there are multiple pages of results', () => {
      beforeEach(() => {
        numberOfPages = 6
        page = 2
      })

      it('returns "Search results" with the page number and total page count', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.pageTitle).to.equal('Search results (page 2 of 6)')
      })
    })

    describe('when there is a single page of results', () => {
      it('returns "Search results"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.pageTitle).to.equal('Search results')
      })
    })
  })

  describe('the "returnLogs" property', () => {
    describe('when no matching return logs have been found', () => {
      beforeEach(() => {
        returnLogs = null
      })

      it('returns "null"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.returnLogs).to.be.null()
      })
    })

    describe('when some matching return logs have been found', () => {
      it('returns an array', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.returnLogs[0]).to.exist()
        expect(result.returnLogs.length).to.equal(1)
      })
    })
  })

  describe('the "showResults" property', () => {
    describe('when no search result page is requested', () => {
      beforeEach(() => {
        page = undefined
      })

      it('returns "false"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.showResults).to.be.false()
      })
    })

    describe('when a search result page is requested', () => {
      it('returns "true"', () => {
        const result = SearchPresenter.go(query, page, numberOfPages, licences, returnLogs)

        expect(result.showResults).to.be.true()
      })
    })
  })
})
