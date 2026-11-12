// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test Helpers
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import ContactDetailsPresenter from '../../../src/presenters/licences/contact-details.presenter.js'

describe('Licences - Contact Details presenter', () => {
  let companyId
  let contacts
  let licence

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    companyId = generateUUID()

    contacts = [
      {
        contactName: 'Rachael Tyrell',
        contactType: 'additional-contact',
        id: generateUUID()
      },
      {
        contactName: 'Eldon Tyrell',
        contactType: 'licence-holder',
        id: companyId
      }
    ]
  })

  describe('when provided with populated contacts data', () => {
    it('correctly presents the data', () => {
      const result = ContactDetailsPresenter(contacts, licence)

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
          },
          {
            link: `/system/companies/${companyId}/licence-holder`,
            name: 'Eldon Tyrell',
            type: 'Licence holder'
          }
        ],
        licenceHolderContactsLink: `/system/companies/${companyId}/contacts`,
        pageTitle: 'Contact details',
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })

    describe('the "licenceHolderContactsLink" property', () => {
      describe('when the the licence has a "licence Holder" licence contact', () => {
        it('returns the link to licence holder contacts', () => {
          const result = ContactDetailsPresenter(contacts, licence)

          expect(result.licenceHolderContactsLink).toEqual(`/system/companies/${companyId}/contacts`)
        })
      })

      describe('when the the licence does not have a "licence Holder" licence contact', () => {
        beforeEach(() => {
          contacts.pop()
        })

        it('returns null', () => {
          const result = ContactDetailsPresenter(contacts, licence)

          expect(result.licenceHolderContactsLink).toBeNull()
        })
      })
    })

    describe('and there is a contact with the type', () => {
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
          const result = ContactDetailsPresenter(contacts, licence)

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
          const result = ContactDetailsPresenter(contacts, licence)

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
          const result = ContactDetailsPresenter(contacts, licence)

          expect(result.contacts).toEqual([
            {
              link: `/system/billing-accounts/${contacts[0].id}?licence-id=${licence.id}`,
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
          const result = ContactDetailsPresenter(contacts, licence)

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
          const result = ContactDetailsPresenter(contacts, licence)

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
          const result = ContactDetailsPresenter(contacts, licence)

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
          const result = ContactDetailsPresenter(contacts, licence)

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
          const result = ContactDetailsPresenter(contacts, licence)

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
