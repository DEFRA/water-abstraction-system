'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SearchPresenter = require('../../../app/presenters/search/search.presenter.js')

describe('Search - Search presenter', () => {
  let allSearchMatches
  let numberOfPages
  let page
  let query
  let resultType

  beforeEach(() => {
    query = 'searchthis'
    resultType = 'all'

    numberOfPages = 1
    page = 1

    allSearchMatches = {
      exactSearchResults: {
        amountFound: 3,
        licences: {
          results: [
            {
              $ends: () => {
                return null
              },
              id: 'licence-1',
              licenceRef: '01/123',
              metadata: { contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr' }] }
            }
          ],
          total: 1
        },
        monitoringStations: {
          results: [
            {
              catchmentName: 'Catchment 1',
              id: 'monitoring-station-1',
              gridReference: 'SX1234512345',
              label: 'Monitoring Station 1',
              riverName: 'River 1'
            }
          ],
          total: 1
        },
        returnLogs: {
          results: [
            {
              dueDates: [new Date('2001-01-01')],
              endDates: [new Date('2000-12-31')],
              id: 'licence-1',
              ids: ['v1:1:1/2/3:1:2000-01-01:2000-12-31'],
              licenceRef: '01/123',
              returnReference: '123',
              returnRequirementId: 'return-requirement-1',
              statuses: ['completed']
            }
          ],
          total: 1
        }
      },
      largestResultCount: 1,
      similarSearchResults: {
        amountFound: 3,
        licences: {
          results: [
            {
              $ends: () => {
                return null
              },
              id: 'licence-1',
              licenceRef: '01/123',
              metadata: { contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr' }] }
            }
          ],
          total: 1
        },
        monitoringStations: {
          results: [
            {
              catchmentName: 'Catchment 1',
              id: 'monitoring-station-1',
              gridReference: 'SX1234512345',
              label: 'Monitoring Station 1',
              riverName: 'River 1'
            }
          ],
          total: 1
        },
        returnLogs: {
          results: [
            {
              dueDates: [new Date('2001-01-01')],
              endDates: [new Date('2000-12-31')],
              id: 'licence-1',
              ids: ['v1:1:1/2/3:1:2000-01-01:2000-12-31'],
              licenceRef: '01/123',
              returnReference: '123',
              returnRequirementId: 'return-requirement-1',
              statuses: ['completed']
            }
          ],
          total: 1
        }
      }
    }
  })

  it('correctly presents the data', () => {
    const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

    expect(result).to.equal({
      exactMatches: {
        licences: [
          {
            id: 'licence-1',
            licenceEndDate: null,
            licenceEndedText: null,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '01/123'
          }
        ],
        monitoringStations: [
          {
            catchmentName: 'Catchment 1',
            gridReference: 'SX1234512345',
            id: 'monitoring-station-1',
            label: 'Monitoring Station 1',
            riverName: 'River 1'
          }
        ],
        returnLogs: [
          {
            endDate: '31 December 2000',
            id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
            licenceId: 'licence-1',
            licenceRef: '01/123',
            returnReference: '123',
            statusText: 'complete'
          }
        ]
      },
      noPartialResults: false,
      noResults: false,
      page: 1,
      pageTitle: 'Search results',
      partialMatches: {
        licences: [
          {
            id: 'licence-1',
            licenceEndDate: null,
            licenceEndedText: null,
            licenceHolderName: 'Mr F Surname',
            licenceRef: '01/123'
          }
        ],
        monitoringStations: [
          {
            catchmentName: 'Catchment 1',
            gridReference: 'SX1234512345',
            id: 'monitoring-station-1',
            label: 'Monitoring Station 1',
            riverName: 'River 1'
          }
        ],
        returnLogs: [
          {
            endDate: '31 December 2000',
            id: 'v1:1:1/2/3:1:2000-01-01:2000-12-31',
            licenceId: 'licence-1',
            licenceRef: '01/123',
            returnReference: '123',
            statusText: 'complete'
          }
        ]
      },
      query: 'searchthis',
      resultType: 'all',
      showExactResults: true,
      showResults: true
    })
  })

  describe('the "exactMatches" property', () => {
    describe('the "exactMatches.licences" property', () => {
      describe('when no exactly matching licences have been found', () => {
        beforeEach(() => {
          allSearchMatches.exactSearchResults.licences = { results: [], total: 0 }
          allSearchMatches.exactSearchResults.amountFound = 2
        })

        it('returns "null"', () => {
          const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

          expect(result.exactMatches.licences).to.be.null()
        })
      })

      describe('when some exactly matching licences have been found', () => {
        it('returns an array', () => {
          const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

          expect(result.exactMatches.licences[0]).to.exist()
          expect(result.exactMatches.licences.length).to.equal(1)
        })
      })
    })

    describe('the "exactMatches.monitoringStations" property', () => {
      describe('when no exactly matching monitoring stations have been found', () => {
        beforeEach(() => {
          allSearchMatches.exactSearchResults.monitoringStations = { results: [], total: 0 }
          allSearchMatches.exactSearchResults.amountFound = 2
        })

        it('returns "null"', () => {
          const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

          expect(result.exactMatches.monitoringStations).to.be.null()
        })
      })

      describe('when some exactly matching monitoring stations have been found', () => {
        it('returns an array', () => {
          const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

          expect(result.exactMatches.monitoringStations[0]).to.exist()
          expect(result.exactMatches.monitoringStations.length).to.equal(1)
        })
      })
    })

    describe('the "exactMatches.returnLogs" property', () => {
      describe('when no exactly matching return logs have been found', () => {
        beforeEach(() => {
          allSearchMatches.exactSearchResults.returnLogs = { results: [], total: 0 }
          allSearchMatches.exactSearchResults.amountFound = 2
        })

        it('returns "null"', () => {
          const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

          expect(result.exactMatches.returnLogs).to.be.null()
        })
      })

      describe('when some exactly matching return logs have been found', () => {
        it('returns an array', () => {
          const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

          expect(result.exactMatches.returnLogs[0]).to.exist()
          expect(result.exactMatches.returnLogs.length).to.equal(1)
        })
      })
    })
  })

  describe('the "noPartialResults" property', () => {
    describe('when no partial matches have been found', () => {
      beforeEach(() => {
        allSearchMatches.similarSearchResults = {
          amountFound: 0,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 }
        }
      })

      it('returns "true"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.noPartialResults).to.be.true()
      })
    })

    describe('when some partial matches have been found', () => {
      it('returns "false"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.noPartialResults).to.be.false()
      })
    })
  })

  describe('the "noResults" property', () => {
    describe('when there are neither exact nor partial matches', () => {
      beforeEach(() => {
        allSearchMatches = {
          exactSearchResults: {
            amountFound: 0,
            licences: { results: [], total: 0 },
            monitoringStations: { results: [], total: 0 },
            returnLogs: { results: [], total: 0 }
          },
          largestResultCount: 0,
          similarSearchResults: {
            amountFound: 0,
            licences: { results: [], total: 0 },
            monitoringStations: { results: [], total: 0 },
            returnLogs: { results: [], total: 0 }
          }
        }
      })

      it('returns "true"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.noResults).to.be.true()
      })
    })

    describe('when there are only exact matches', () => {
      beforeEach(() => {
        allSearchMatches.similarSearchResults = {
          amountFound: 0,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 }
        }
      })

      it('returns "false"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.noResults).to.be.false()
      })
    })

    describe('when there are only partial matches', () => {
      beforeEach(() => {
        allSearchMatches.exactSearchResults = {
          amountFound: 0,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 }
        }
      })

      it('returns "false"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.noResults).to.be.false()
      })
    })

    describe('when all searches have results', () => {
      it('returns "false"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.noResults).to.be.false()
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when the blank search page is shown', () => {
      beforeEach(() => {
        allSearchMatches = undefined
        numberOfPages = undefined
        page = undefined
        query = undefined
      })

      it('returns "Search"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.pageTitle).to.equal('Search')
      })
    })

    describe('when there are multiple pages of results', () => {
      beforeEach(() => {
        numberOfPages = 6
        page = 2
      })

      it('returns "Search results" with the page number and total page count', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.pageTitle).to.equal('Search results (page 2 of 6)')
      })
    })

    describe('when there is a single page of results', () => {
      it('returns "Search results"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.pageTitle).to.equal('Search results')
      })
    })
  })

  describe('the "partialMatches" property', () => {})

  describe('the "showExactResults" property', () => {
    describe('when there are no exact matches', () => {
      beforeEach(() => {
        allSearchMatches.exactSearchResults = {
          amountFound: 0,
          licences: { results: [], total: 0 },
          monitoringStations: { results: [], total: 0 },
          returnLogs: { results: [], total: 0 }
        }
      })

      it('returns "false"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.showExactResults).to.be.false()
      })
    })

    describe('when there are exact matches', () => {
      it('returns "true"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.showExactResults).to.be.true()
      })
    })
  })

  describe('the "showResults" property', () => {
    describe('when no search result page is requested', () => {
      beforeEach(() => {
        page = undefined
      })

      it('returns "false"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.showResults).to.be.false()
      })
    })

    describe('when a search result page is requested', () => {
      it('returns "true"', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.showResults).to.be.true()
      })
    })
  })

  describe('the "licenceEndedText" property of licences', () => {
    describe('when a licence has an end date in the past', () => {
      beforeEach(() => {
        allSearchMatches.exactSearchResults.licences.results[0].$ends = () => {
          return {
            date: new Date('2020-12-31'),
            reason: 'revoked'
          }
        }
      })

      it('returns the `reason` value', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.exactMatches.licences[0].licenceEndedText).to.equal('revoked')
      })
    })

    describe('when a licence has an end date in the future', () => {
      beforeEach(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        allSearchMatches.exactSearchResults.licences.results[0].$ends = () => {
          return {
            date: tomorrow,
            reason: 'expired'
          }
        }
      })

      it('returns an empty value', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.exactMatches.licences[0].licenceEndedText).to.not.exist()
      })
    })
  })

  describe('the "licenceHolderName" property of licences', () => {
    describe('when a licence has no contacts', () => {
      beforeEach(() => {
        allSearchMatches.exactSearchResults.licences.results[0].metadata = {}
      })

      it('returns a blank name', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.exactMatches.licences[0].licenceHolderName).to.equal('')
      })
    })

    describe('when a licence has no licence holder contact', () => {
      beforeEach(() => {
        allSearchMatches.exactSearchResults.licences.results[0].metadata = {
          contacts: [{ initials: 'F', name: 'Surname', role: 'Not a licence holder', salutation: 'Mr' }]
        }
      })

      it('returns a blank name', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.exactMatches.licences[0].licenceHolderName).to.equal('')
      })
    })
  })

  describe('the "id" and "statusText" properties of return logs', () => {
    describe('when multiple return logs have been found for a single return reference', () => {
      beforeEach(() => {
        allSearchMatches.exactSearchResults.returnLogs.results = [
          {
            dueDates: [new Date('2001-01-01'), new Date('2002-01-01')],
            endDates: [new Date('2000-12-31'), new Date('2001-12-31')],
            id: 'licence-1',
            ids: ['v1:1:1/2/3:1:2000-01-01:2000-12-31', 'v1:1:1/2/3:1:2001-01-01:2001-12-31'],
            licenceRef: '01/123',
            returnReference: '123',
            returnRequirementId: 'return-requirement-1',
            statuses: ['completed', 'due']
          }
        ]
      })

      it('returns the latest id, end date and status', () => {
        const result = SearchPresenter.go(query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.exactMatches.returnLogs[0].endDate).to.equal('31 December 2001')
        expect(result.exactMatches.returnLogs[0].id).to.equal('v1:1:1/2/3:1:2001-01-01:2001-12-31')
        expect(result.exactMatches.returnLogs[0].statusText).to.equal('overdue')
      })
    })
  })
})
