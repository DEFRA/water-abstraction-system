// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'

// Thing under test
import CompanyWithAddressPresenter from '../../../app/presenters/companies/company-with-address.presenter.js'

describe('Companies - Company With Address Presenter', () => {
  const licenceId = 'fbf2df24-ac78-4ee2-b5bb-eb7f9cf6b59a'
  const role = 'licence-holder'

  let address
  let company

  beforeEach(() => {
    company = CustomersFixtures.company()
    address = CustomersFixtures.companyAddress().address
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CompanyWithAddressPresenter(company, address, role, licenceId)

      expect(result).toEqual({
        backLink: {
          href: `/system/licences/${licenceId}/contact-details`,
          text: 'Go back to contact details'
        },
        details: {
          address: [
            'The Tyrell Spire',
            'Floor 667 (Above the Smog)',
            'Southbank Industrial Sector',
            'Lambeth Precinct',
            'Greater London',
            'United Kingdom',
            'SE1 7TY',
            'UK'
          ],
          name: 'Tyrell Corporation'
        },
        pageTitle: 'Licence holder',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "backLink" property', () => {
      describe('when the "licenceId" is provide', () => {
        it('returns a link to the licence contact details page', () => {
          const result = CompanyWithAddressPresenter(company, address, role, licenceId)

          expect(result.backLink).toEqual({
            href: `/system/licences/${licenceId}/contact-details`,
            text: 'Go back to contact details'
          })
        })
      })

      describe('when the "licenceId" is not provided', () => {
        it('returns a link to the licence holder contacts page', () => {
          const result = CompanyWithAddressPresenter(company, address, role)

          expect(result.backLink).toEqual({
            href: `/system/companies/${company.id}/contacts`,
            text: 'Go back to licence holder contacts'
          })
        })
      })
    })
  })
})
