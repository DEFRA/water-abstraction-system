// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import CustomersFixtures from '../../support/fixtures/customers.fixture.js'

// Thing under test
import HistoryPresenter from '../../../app/presenters/companies/history.presenter.js'

describe('Companies - History presenter', () => {
  let company
  let licences

  beforeEach(() => {
    company = CustomersFixtures.company()
    licences = CustomersFixtures.licences()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = HistoryPresenter(company, licences)

      expect(result).toEqual({
        backLink: {
          href: '/',
          text: 'Go back to search'
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
