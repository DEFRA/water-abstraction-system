// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from 'water-abstraction-engine/test/generators.js'
import CustomersFixtures from '../../support/fixtures/customers.fixture.js'

// Thing under test
import ContactsPresenter from '../../../src/presenters/companies/contacts.presenter.js'

describe('Companies - Contacts presenter', () => {
  let company
  let contacts

  beforeEach(() => {
    company = CustomersFixtures.company()

    contacts = [
      {
        contactName: 'Rachael Tyrell',
        contactType: 'additional-contact',
        id: generateUUID()
      }
    ]
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactsPresenter(company, contacts)

      expect(result).toEqual({
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        contacts: [
          {
            link: `/system/company-contacts/${contacts[0].id}/contact-details`,
            name: 'Rachael Tyrell',
            type: 'Additional contact'
          }
        ],
        links: {
          createContact: `/system/company-contacts/setup/${company.id}`
        },
        pageTitle: 'Contacts',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })

    describe('and there is a company contact with the type', () => {
      describe('"abstraction-alerts"', () => {
        beforeEach(() => {
          contacts = [
            {
              contactName: 'Rachael Tyrell',
              contactType: 'abstraction-alerts',
              id: generateUUID()
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter(company, contacts)

          expect(result.contacts).toEqual([
            {
              link: `/system/company-contacts/${contacts[0].id}/contact-details`,
              name: 'Rachael Tyrell',
              type: 'Abstraction alerts'
            }
          ])
        })
      })

      describe('"additional-contact"', () => {
        beforeEach(() => {
          contacts = [
            {
              contactName: 'Rachael Tyrell',
              contactType: 'additional-contact',
              id: generateUUID()
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter(company, contacts)

          expect(result.contacts).toEqual([
            {
              link: `/system/company-contacts/${contacts[0].id}/contact-details`,
              name: 'Rachael Tyrell',
              type: 'Additional contact'
            }
          ])
        })
      })

      describe('"billing"', () => {
        beforeEach(() => {
          contacts = [
            {
              contactName: 'Rachael Tyrell',
              contactType: 'billing',
              id: generateUUID()
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter(company, contacts)

          expect(result.contacts).toEqual([
            {
              link: `/system/billing-accounts/${contacts[0].id}?company-id=${company.id}`,
              name: 'Rachael Tyrell',
              type: 'Billing'
            }
          ])
        })
      })

      describe('"basic-user"', () => {
        beforeEach(() => {
          contacts = [
            {
              contactName: 'user@test.com',
              contactType: 'basic-user',
              id: generateUUID()
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter(company, contacts)

          expect(result.contacts).toEqual([
            {
              link: `/system/users/external/${contacts[0].id}/details?back=search`,
              name: 'user@test.com',
              type: 'Basic user'
            }
          ])
        })
      })

      describe('"primary-user"', () => {
        beforeEach(() => {
          contacts = [
            {
              contactName: 'user@test.com',
              contactType: 'primary-user',
              id: generateUUID()
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter(company, contacts)

          expect(result.contacts).toEqual([
            {
              link: `/system/users/external/${contacts[0].id}/details?back=search`,
              name: 'user@test.com',
              type: 'Primary user'
            }
          ])
        })
      })

      describe('"returns-user"', () => {
        beforeEach(() => {
          contacts = [
            {
              contactName: 'user@test.com',
              contactType: 'returns-user',
              id: generateUUID()
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter(company, contacts)

          expect(result.contacts).toEqual([
            {
              link: `/system/users/external/${contacts[0].id}/details?back=search`,
              name: 'user@test.com',
              type: 'Returns user'
            }
          ])
        })
      })

      describe('"licence-holder"', () => {
        beforeEach(() => {
          contacts = [
            {
              contactName: 'Rachael Tyrell',
              contactType: 'licence-holder',
              id: generateUUID()
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter(company, contacts)

          expect(result.contacts).toEqual([
            {
              link: `/system/companies/${contacts[0].id}/licence-holder`,
              name: 'Rachael Tyrell',
              type: 'Licence holder'
            }
          ])
        })
      })

      describe('"returns-to"', () => {
        beforeEach(() => {
          contacts = [
            {
              contactName: 'Rachael Tyrell',
              contactType: 'returns-to',
              id: generateUUID()
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter(company, contacts)

          expect(result.contacts).toEqual([
            {
              link: `/system/companies/${contacts[0].id}/returns-to`,
              name: 'Rachael Tyrell',
              type: 'Returns to'
            }
          ])
        })
      })
    })
  })
})
