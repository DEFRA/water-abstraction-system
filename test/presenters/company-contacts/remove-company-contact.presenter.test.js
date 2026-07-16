// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'
import { licenceEnds } from '../../support/fixtures/licence.fixture.js'

// Thing under test
import RemoveCompanyContactPresenter from '../../../app/presenters/company-contacts/remove-company-contact.presenter.js'

describe('Company Contacts - Remove Company Contact Presenter', () => {
  let companyContact
  let company
  let licences

  beforeEach(() => {
    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    licences = []
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = RemoveCompanyContactPresenter(company, companyContact, licences)

      expect(result).toEqual({
        backLink: {
          href: `/system/company-contacts/${companyContact.id}/contact-details`,
          text: 'Go back to contact details'
        },
        contact: {
          abstractionAlertsLabel: 'No',
          email: 'rachael.tyrell@tyrellcorp.com',
          licences: [],
          name: 'Rachael Tyrell'
        },
        pageTitle: "You're about to remove this contact",
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('the "licences" property', () => {
      describe('when the abstractionAlertType is not "some"', () => {
        it('returns an empty array', () => {
          const result = RemoveCompanyContactPresenter(company, companyContact, licences)

          expect(result.contact.licences).toEqual([])
        })
      })

      describe('when the abstractionAlertType is "some"', () => {
        beforeEach(() => {
          licences = [licenceEnds()]

          companyContact.abstractionAlerts = true
          companyContact.abstractionAlertLicences = [licences[0].id]
        })

        it('returns the licence refs', () => {
          const result = RemoveCompanyContactPresenter(company, companyContact, licences)

          expect(result.contact.licences).toEqual([licences[0].licenceRef])
        })
      })
    })

    describe('the "warning" property', () => {
      describe('when the "companyContact" is marked for "abstractionAlerts"', () => {
        describe('and the "abstractionAlertsCount" is 1', () => {
          beforeEach(() => {
            companyContact.abstractionAlerts = true
            companyContact.abstractionAlertsCount = 1
          })

          it('returns the warning', () => {
            const result = RemoveCompanyContactPresenter(company, companyContact, licences)

            expect(result.warning).toEqual({
              iconFallbackText: 'Warning',
              text: 'Removing this contact means the licence holder will receive future water abstraction alerts by post.'
            })
          })
        })

        describe('and the "abstractionAlertsCount" is greater than 1', () => {
          beforeEach(() => {
            companyContact.abstractionAlerts = true
            companyContact.abstractionAlertsCount = 2
          })

          it('does not return the warning', () => {
            const result = RemoveCompanyContactPresenter(company, companyContact, licences)

            expect(result.warning).toBeUndefined()
          })
        })
      })

      describe('when the "companyContact" is not marked for "abstractionAlerts"', () => {
        beforeEach(() => {
          companyContact.abstractionAlerts = false
          companyContact.abstractionAlertsCount = 1
        })

        it('does not return the warning', () => {
          const result = RemoveCompanyContactPresenter(company, companyContact, licences)

          expect(result.warning).toBeUndefined()
        })
      })
    })
  })
})
