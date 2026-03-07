'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Thing under test
const HistoryPresenter = require('../../../app/presenters/companies/history.presenter.js')

describe('Companies - History presenter', () => {
  let company
  let licences

  beforeEach(() => {
    company = CustomersFixtures.company()
    licences = CustomersFixtures.licences()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = HistoryPresenter.go(company, licences)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        licenceVersions: [
          {
            changeType: 'licence issued',
            count: 1,
            endDate: null,
            licenceId: licences[0].id,
            licenceRef: licences[0].licenceRef,
            link: {
              hiddenText: 'current licence version',
              href: `/system/licence-versions/${licences[0].licenceVersions[0].id}`
            },
            startDate: '1 January 2022'
          }
        ],
        pageTitle: 'History',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
