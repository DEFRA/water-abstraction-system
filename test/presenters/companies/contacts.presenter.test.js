'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ContactsPresenter = require('../../../app/presenters/companies/contacts.presenter.js')

describe('Companies - Contacts presenter', () => {
  let company
  let contacts

  beforeEach(() => {
    company = CustomersFixtures.company()

    contacts = [
      {
        id: generateUUID(),
        contactType: 'additional-contact',
        contactName: 'Rachael Tyrell'
      }
    ]

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerManage').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactsPresenter.go(company, contacts)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        contacts: [
          {
            link: `/system/company-contacts/${contacts[0].id}`,
            type: 'Additional contact',
            name: 'Rachael Tyrell'
          }
        ],
        links: {
          createContact: `/system/company-contacts/setup/${company.id}`,
          removeContact: null
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
              id: generateUUID(),
              contactType: 'abstraction-alerts',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter.go(company, contacts)

          expect(result.contacts).to.equal([
            {
              link: `/system/company-contacts/${contacts[0].id}`,
              type: 'Abstraction alerts',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })

      describe('"additional-contact"', () => {
        beforeEach(() => {
          contacts = [
            {
              id: generateUUID(),
              contactType: 'additional-contact',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter.go(company, contacts)

          expect(result.contacts).to.equal([
            {
              link: `/system/company-contacts/${contacts[0].id}`,
              type: 'Additional contact',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })

      describe('"billing"', () => {
        beforeEach(() => {
          contacts = [
            {
              id: generateUUID(),
              contactType: 'billing',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter.go(company, contacts)

          expect(result.contacts).to.equal([
            {
              link: `/system/billing-accounts/${contacts[0].id}?company-id=${company.id}`,
              type: 'Billing',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })

      describe('"basic-user"', () => {
        beforeEach(() => {
          contacts = [
            {
              id: generateUUID(),
              contactType: 'basic-user',
              contactName: 'user@test.com'
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter.go(company, contacts)

          expect(result.contacts).to.equal([
            {
              link: `/system/users/external/${contacts[0].id}`,
              type: 'Basic user',
              name: 'user@test.com'
            }
          ])
        })
      })

      describe('"primary-user"', () => {
        beforeEach(() => {
          contacts = [
            {
              id: generateUUID(),
              contactType: 'primary-user',
              contactName: 'user@test.com'
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter.go(company, contacts)

          expect(result.contacts).to.equal([
            {
              link: `/system/users/external/${contacts[0].id}`,
              type: 'Primary user',
              name: 'user@test.com'
            }
          ])
        })
      })

      describe('"returns-user"', () => {
        beforeEach(() => {
          contacts = [
            {
              id: generateUUID(),
              contactType: 'returns-user',
              contactName: 'user@test.com'
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter.go(company, contacts)

          expect(result.contacts).to.equal([
            {
              link: `/system/users/external/${contacts[0].id}`,
              type: 'Returns user',
              name: 'user@test.com'
            }
          ])
        })
      })

      describe('"licence-holder"', () => {
        beforeEach(() => {
          contacts = [
            {
              id: generateUUID(),
              contactType: 'licence-holder',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter.go(company, contacts)

          expect(result.contacts).to.equal([
            {
              link: `/system/companies/${contacts[0].id}/licence-holder`,
              type: 'Licence holder',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })

      describe('"returns-to"', () => {
        beforeEach(() => {
          contacts = [
            {
              id: generateUUID(),
              contactType: 'returns-to',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct contact', () => {
          const result = ContactsPresenter.go(company, contacts)

          expect(result.contacts).to.equal([
            {
              link: `/system/companies/${contacts[0].id}/returns-to`,
              type: 'Returns to',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })
    })
  })
})
