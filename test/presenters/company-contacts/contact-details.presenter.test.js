// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'
import { licenceEnds } from '../../support/fixtures/licence.fixture.js'
import { yesterday } from '../../support/general.js'

// Thing under test
import ContactDetailsPresenter from '../../../app/presenters/company-contacts/contact-details.presenter.js'

describe('Company Contacts - Contact Details presenter', () => {
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
      const result = ContactDetailsPresenter(company, companyContact, licences)

      expect(result).toEqual({
        additionalContact: true,
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to licence holder contacts'
        },
        contact: {
          abstractionAlertsLabel: 'No',
          created: '1 January 2022 by nexus6.hunter@offworld.net',
          email: 'rachael.tyrell@tyrellcorp.com',
          lastUpdated: '1 January 2022 by void.kampff@tyrell.com',
          licences: [],
          name: 'Rachael Tyrell'
        },
        editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
        warning: null,
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`
      })
    })

    describe('the "contact" property', () => {
      describe('the "additionalContact" property', () => {
        describe('when the contact is an additional contact', () => {
          it('returns true', () => {
            const result = ContactDetailsPresenter(company, companyContact, licences)

            expect(result.additionalContact).toBe(true)
          })
        })

        describe('when the contact is not an additional contact', () => {
          beforeEach(() => {
            companyContact.licenceRole.name = 'licenceHolder'
          })

          it('returns false', () => {
            const result = ContactDetailsPresenter(company, companyContact, licences)

            expect(result.additionalContact).toBe(false)
          })
        })
      })

      describe('the "created" property', () => {
        describe('when there is "createdByUser"', () => {
          it('returns the created text with the created at date and the created by username', () => {
            const result = ContactDetailsPresenter(company, companyContact, licences)

            expect(result.contact.created).toEqual('1 January 2022 by nexus6.hunter@offworld.net')
          })
        })

        describe('when there is no "createdByUser"', () => {
          beforeEach(() => {
            companyContact.createdByUser = null
          })

          it('returns the created text with the created at date', () => {
            const result = ContactDetailsPresenter(company, companyContact, licences)

            expect(result.contact.created).toEqual('1 January 2022')
          })
        })
      })

      describe('the "lastUpdated" property', () => {
        describe('when there is "updatedByUser"', () => {
          it('returns the created text with the updated at date and the updated by username', () => {
            const result = ContactDetailsPresenter(company, companyContact, licences)

            expect(result.contact.lastUpdated).toEqual('1 January 2022 by void.kampff@tyrell.com')
          })
        })

        describe('when there is no "updatedByUser"', () => {
          beforeEach(() => {
            companyContact.updatedByUser = null
          })

          it('returns the created text with the created at date', () => {
            const result = ContactDetailsPresenter(company, companyContact, licences)

            expect(result.contact.lastUpdated).toEqual('1 January 2022')
          })
        })
      })

      describe('the "licences" property', () => {
        describe('when the abstractionAlertType is not "some"', () => {
          it('returns an empty array', () => {
            const result = ContactDetailsPresenter(company, companyContact, licences)

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
            const result = ContactDetailsPresenter(company, companyContact, licences)

            expect(result.contact.licences).toEqual([licences[0].licenceRef])
          })
        })
      })
    })

    describe('the "warning" property', () => {
      describe('when no licences have ended', () => {
        it('returns null', () => {
          const result = ContactDetailsPresenter(company, companyContact, licences)

          expect(result.warning).toBeNull()
        })
      })

      describe('when one or more licences have ended', () => {
        beforeEach(() => {
          licences = [licenceEnds(yesterday())]
        })

        it('returns a warning object', () => {
          const result = ContactDetailsPresenter(company, companyContact, licences)

          expect(result.warning).toEqual({
            text: 'One or more licences for abstraction alerts have ended. No alerts will be sent for these.',
            iconFallbackText: 'Warning'
          })
        })
      })
    })
  })
})
