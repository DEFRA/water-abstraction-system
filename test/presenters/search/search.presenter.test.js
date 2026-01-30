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
  let userScopes

  beforeEach(() => {
    userScopes = ['billing']
    query = 'searchthis'
    resultType = null

    numberOfPages = 1
    page = 1

    allSearchMatches = {
      results: [
        {
          exact: true,
          model: {
            accountNumber: 'A12345678A',
            company: { name: 'Company 1' },
            createdAt: new Date('2000-01-01T00:00:00.000Z'),
            id: 'billing-account-1'
          },
          type: 'billingAccount'
        },
        {
          exact: true,
          model: {
            id: 'licence-holder-1',
            licenceDocumentRoles: [{ licenceDocumentId: 'licence-1', licenceRole: { name: 'licenceHolder' } }],
            name: 'Mr F Surname',
            type: 'organisation'
          },
          type: 'licenceHolder'
        },
        {
          exact: true,
          model: {
            $ends: () => {
              return null
            },
            id: 'licence-1',
            licenceRef: '01/123',
            licenceDocumentHeader: {
              metadata: {
                contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr', type: 'Person' }]
              }
            }
          },
          type: 'licence'
        },
        {
          exact: true,
          model: {
            catchmentName: 'Catchment 1',
            id: 'monitoring-station-1',
            gridReference: 'SX1234512345',
            label: 'Monitoring Station 1',
            riverName: 'River 1'
          },
          type: 'monitoringStation'
        },
        {
          exact: true,
          model: {
            dueDates: [new Date('2001-01-01')],
            endDates: [new Date('2000-12-31')],
            id: 'return-log-1',
            licenceRef: '01/123',
            returnReference: '123',
            returnRequirementId: 'return-requirement-1',
            statuses: ['completed']
          },
          type: 'returnLog'
        },
        {
          exact: true,
          model: {
            application: 'water_admin',
            id: 'user-1',
            lastLogin: new Date('2001-01-01T00:00:00Z'),
            username: 'TESTSEARCH01@wrls.gov.uk'
          },
          type: 'user'
        },
        {
          exact: false,
          model: {
            accountNumber: 'A12345678A',
            company: { name: 'Company 1' },
            createdAt: new Date('2000-01-01T00:00:00.000Z'),
            id: 'billing-account-1'
          },
          type: 'billingAccount'
        },
        {
          exact: false,
          model: {
            id: 'licence-holder-1',
            licenceDocumentRoles: [{ licenceDocumentId: 'licence-1', licenceRole: { name: 'licenceHolder' } }],
            name: 'Mr F Surname',
            type: 'organisation'
          },
          type: 'licenceHolder'
        },
        {
          exact: false,
          model: {
            $ends: () => {
              return null
            },
            id: 'licence-1',
            licenceRef: '01/123',
            licenceDocumentHeader: {
              metadata: {
                contacts: [{ initials: 'F', name: 'Surname', role: 'Licence holder', salutation: 'Mr', type: 'Person' }]
              }
            }
          },
          type: 'licence'
        },
        {
          exact: false,
          model: {
            catchmentName: 'Catchment 1',
            id: 'monitoring-station-1',
            gridReference: 'SX1234512345',
            label: 'Monitoring Station 1',
            riverName: 'River 1'
          },
          type: 'monitoringStation'
        },
        {
          exact: false,
          model: {
            dueDates: [new Date('2001-01-01')],
            endDates: [new Date('2000-12-31')],
            id: 'return-log-1',
            licenceRef: '01/123',
            returnReference: '123',
            returnRequirementId: 'return-requirement-1',
            statuses: ['completed']
          },
          type: 'returnLog'
        },
        {
          exact: false,
          model: {
            application: 'water_admin',
            id: 'user-1',
            lastLogin: new Date('2001-01-01T00:00:00Z'),
            username: 'TESTSEARCH01@wrls.gov.uk'
          },
          type: 'user'
        },
        {
          exact: false,
          type: 'UNKNOWN_TYPE'
        }
      ],
      total: 13
    }
  })

  it('correctly presents the data', () => {
    const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

    expect(result).to.equal({
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
      noResults: false,
      page: 1,
      pageTitle: 'Search results for "searchthis"',
      pageTitleCaption: null,
      query: 'searchthis',
      results: [
        {
          col2Title: 'Holder',
          col2Value: 'Company 1',
          col3Title: 'Created date',
          col3Value: '1 January 2000',
          exact: true,
          link: '/system/billing-accounts/billing-account-1',
          reference: 'A12345678A',
          statusTag: null,
          type: 'Billing account'
        },
        {
          col2Title: 'Number of licences',
          col2Value: 1,
          col3Title: 'Type',
          col3Value: 'organisation',
          exact: true,
          link: '/system/companies/licence-holder-1/licences',
          reference: 'Mr F Surname',
          statusTag: null,
          type: 'Holder'
        },
        {
          col2Title: 'Licence holder',
          col2Value: 'Mr F Surname',
          col3Title: 'End date',
          col3Value: null,
          exact: true,
          link: '/system/licences/licence-1/summary',
          reference: '01/123',
          statusTag: null,
          type: 'Licence'
        },
        {
          col2Title: 'River',
          col2Value: 'River 1',
          col3Title: 'Grid reference',
          col3Value: 'SX1234512345',
          exact: true,
          link: '/system/monitoring-stations/monitoring-station-1',
          reference: 'Monitoring Station 1',
          statusTag: null,
          type: 'Monitoring station'
        },
        {
          col2Title: 'Licence',
          col2Value: '01/123',
          col3Title: 'End date',
          col3Value: null,
          exact: true,
          link: '/system/return-logs/return-log-1',
          reference: '123',
          statusTag: undefined,
          type: 'Return reference'
        },
        {
          col2Title: 'Type',
          col2Value: 'Internal',
          col3Title: 'Last signed in',
          col3Value: '1 January 2001',
          exact: true,
          link: '/user/user-1/status',
          reference: 'TESTSEARCH01@wrls.gov.uk',
          statusTag: null,
          type: 'User'
        },
        {
          col2Title: 'Holder',
          col2Value: 'Company 1',
          col3Title: 'Created date',
          col3Value: '1 January 2000',
          exact: false,
          link: '/system/billing-accounts/billing-account-1',
          reference: 'A12345678A',
          statusTag: null,
          type: 'Billing account'
        },
        {
          col2Title: 'Number of licences',
          col2Value: 1,
          col3Title: 'Type',
          col3Value: 'organisation',
          exact: false,
          link: '/system/companies/licence-holder-1/licences',
          reference: 'Mr F Surname',
          statusTag: null,
          type: 'Holder'
        },
        {
          col2Title: 'Licence holder',
          col2Value: 'Mr F Surname',
          col3Title: 'End date',
          col3Value: null,
          exact: false,
          link: '/system/licences/licence-1/summary',
          reference: '01/123',
          statusTag: null,
          type: 'Licence'
        },
        {
          col2Title: 'River',
          col2Value: 'River 1',
          col3Title: 'Grid reference',
          col3Value: 'SX1234512345',
          exact: false,
          link: '/system/monitoring-stations/monitoring-station-1',
          reference: 'Monitoring Station 1',
          statusTag: null,
          type: 'Monitoring station'
        },
        {
          col2Title: 'Licence',
          col2Value: '01/123',
          col3Title: 'End date',
          col3Value: null,
          exact: false,
          link: '/system/return-logs/return-log-1',
          reference: '123',
          statusTag: undefined,
          type: 'Return reference'
        },
        {
          col2Title: 'Type',
          col2Value: 'Internal',
          col3Title: 'Last signed in',
          col3Value: '1 January 2001',
          exact: false,
          link: '/user/user-1/status',
          reference: 'TESTSEARCH01@wrls.gov.uk',
          statusTag: null,
          type: 'User'
        }
      ],
      resultType: null,
      showResults: true
    })
  })

  describe('the "filterItems" property', () => {
    describe('when the result type is "all"', () => {
      beforeEach(() => {
        resultType = 'all'
      })

      it('returns no selected items', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.filterItems).to.equal([
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
        ])
      })
    })

    describe('when the result type is "billingAccount"', () => {
      beforeEach(() => {
        resultType = 'billingAccount'
      })

      it('returns the selected item', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.filterItems).to.equal([
          {
            checked: true,
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
        ])
      })
    })

    describe('when the result type is not provided', () => {
      beforeEach(() => {
        resultType = undefined
      })

      it('returns no selected items', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.filterItems).to.equal([
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
        ])
      })
    })

    describe('when the user does not have the "billing" scope', () => {
      beforeEach(() => {
        userScopes = ['not-billing']
      })

      it('does not include the "billingAccount" item', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.filterItems).to.equal([
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
        ])
      })
    })
  })

  describe('the "noResults" property', () => {
    describe('when there are no results', () => {
      beforeEach(() => {
        allSearchMatches = {
          results: [],
          total: 0
        }
      })

      it('returns "true"', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.noResults).to.be.true()
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
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.pageTitle).to.equal('Search')
      })
    })

    describe('when there are search results', () => {
      it('returns "Search results" with the text being searched for', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.pageTitle).to.equal('Search results for "searchthis"')
      })
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when the blank search page is shown', () => {
      beforeEach(() => {
        allSearchMatches = undefined
        numberOfPages = undefined
        page = undefined
        query = undefined
      })

      it('is not displayed', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.pageTitleCaption).to.be.undefined()
      })
    })

    describe('when there are multiple pages of results', () => {
      beforeEach(() => {
        numberOfPages = 6
        page = 2
      })

      it('returns the page number and total page count', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.pageTitleCaption).to.equal('Page 2 of 6')
      })
    })

    describe('when there is a single page of results', () => {
      it('returns "null"', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.pageTitleCaption).to.be.null()
      })
    })
  })

  describe('the "showResults" property', () => {
    describe('when no search result page is requested', () => {
      beforeEach(() => {
        page = undefined
      })

      it('returns "false"', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.showResults).to.be.false()
      })
    })

    describe('when a search result page is requested', () => {
      it('returns "true"', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.showResults).to.be.true()
      })
    })
  })

  describe('the licence holder property "col2Value" for licences', () => {
    describe('when a licence has no contacts', () => {
      beforeEach(() => {
        allSearchMatches.results[2].model.licenceDocumentHeader.metadata = {}
      })

      it('returns a blank name', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.results[2].col2Value).to.equal('')
      })
    })

    describe('when a licence has no licence holder contact', () => {
      beforeEach(() => {
        allSearchMatches.results[2].model.licenceDocumentHeader.metadata = {
          contacts: [{ initials: 'F', name: 'Surname', role: 'Not a licence holder', salutation: 'Mr' }]
        }
      })

      it('returns a blank name', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.results[2].col2Value).to.equal('')
      })
    })
  })

  describe('the "statusTag" property for licences', () => {
    describe('when a licence has an end date in the past', () => {
      beforeEach(() => {
        allSearchMatches.results[2].model.$ends = () => {
          return {
            date: new Date('2020-12-31'),
            reason: 'revoked'
          }
        }
      })

      it('returns the `reason` value', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.results[2].statusTag).to.equal('revoked')
      })
    })

    describe('when a licence has an end date in the future', () => {
      beforeEach(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        allSearchMatches.results[2].model.$ends = () => {
          return {
            date: tomorrow,
            reason: 'expired'
          }
        }
      })

      it('returns an empty value', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.results[2].statusTag).to.not.exist()
      })
    })
  })

  describe('the user type property "col2Value" for users', () => {
    describe('when a user is external', () => {
      beforeEach(() => {
        allSearchMatches.results[5].model.application = 'water_vml'
      })

      it('returns "External"', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.results[5].col2Value).to.equal('External')
      })
    })

    describe('when a user is not external', () => {
      it('returns "Internal"', () => {
        const result = SearchPresenter.go(userScopes, query, resultType, page, numberOfPages, allSearchMatches)

        expect(result.results[5].col2Value).to.equal('Internal')
      })
    })
  })
})
