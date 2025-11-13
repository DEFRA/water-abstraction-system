'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewSearchService = require('../../../app/services/search/view-search.service.js')

describe('Search - View Search service', () => {
  let auth

  describe('when called', () => {
    beforeEach(() => {
      auth = {
        credentials: {
          scope: ['billing']
        }
      }
    })

    it('returns page data for the view', async () => {
      const result = await ViewSearchService.go(auth)

      expect(result).to.equal({
        activeNavBar: 'search',
        filterItems: [
          {
            checked: false,
            text: 'Billing accounts',
            value: 'billingAccount'
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
          }
        ],
        pageTitle: 'Search',
        query: undefined,
        resultType: undefined,
        showResults: false
      })
    })
  })
})
