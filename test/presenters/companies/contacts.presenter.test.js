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
  let companyContacts

  beforeEach(() => {
    company = CustomersFixtures.company()

    companyContacts = [
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
      const result = ContactsPresenter.go(company, companyContacts)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        companyContacts: [
          {
            action: `/system/company-contacts/${companyContacts[0].id}`,
            communicationType: 'Additional contact',
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

    describe('and the is a company contact with the type', () => {
      describe('"abstraction-alerts"', () => {
        beforeEach(() => {
          companyContacts = [
            {
              id: generateUUID(),
              contactType: 'abstraction-alerts',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct company contact', () => {
          const result = ContactsPresenter.go(company, companyContacts)

          expect(result.companyContacts).to.equal([
            {
              action: `/system/company-contacts/${companyContacts[0].id}`,
              communicationType: 'Abstraction alerts',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })

      describe('"additional-contact"', () => {
        beforeEach(() => {
          companyContacts = [
            {
              id: generateUUID(),
              contactType: 'additional-contact',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct company contact', () => {
          const result = ContactsPresenter.go(company, companyContacts)

          expect(result.companyContacts).to.equal([
            {
              action: `/system/company-contacts/${companyContacts[0].id}`,
              communicationType: 'Additional contact',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })

      describe('"billing"', () => {
        beforeEach(() => {
          companyContacts = [
            {
              id: generateUUID(),
              contactType: 'billing',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct company contact', () => {
          const result = ContactsPresenter.go(company, companyContacts)

          expect(result.companyContacts).to.equal([
            {
              action: `/system/billing-accounts/${companyContacts[0].id}?company-id=${company.id}`,
              communicationType: 'Billing',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })

      describe('"basic-user"', () => {
        beforeEach(() => {
          companyContacts = [
            {
              id: generateUUID(),
              contactType: 'basic-user',
              contactName: 'user@test.com'
            }
          ]
        })

        it('returns the correct company contact', () => {
          const result = ContactsPresenter.go(company, companyContacts)

          expect(result.companyContacts).to.equal([
            {
              action: `/system/users/${companyContacts[0].id}`,
              communicationType: 'Basic user',
              name: 'user@test.com'
            }
          ])
        })
      })

      describe('"primary-user"', () => {
        beforeEach(() => {
          companyContacts = [
            {
              id: generateUUID(),
              contactType: 'primary-user',
              contactName: 'user@test.com'
            }
          ]
        })

        it('returns the correct company contact', () => {
          const result = ContactsPresenter.go(company, companyContacts)

          expect(result.companyContacts).to.equal([
            {
              action: `/system/users/${companyContacts[0].id}`,
              communicationType: 'Primary user',
              name: 'user@test.com'
            }
          ])
        })
      })

      describe('"returns-user"', () => {
        beforeEach(() => {
          companyContacts = [
            {
              id: generateUUID(),
              contactType: 'returns-user',
              contactName: 'user@test.com'
            }
          ]
        })

        it('returns the correct company contact', () => {
          const result = ContactsPresenter.go(company, companyContacts)

          expect(result.companyContacts).to.equal([
            {
              action: `/system/users/${companyContacts[0].id}`,
              communicationType: 'Returns user',
              name: 'user@test.com'
            }
          ])
        })
      })

      describe('"licence-holder"', () => {
        beforeEach(() => {
          companyContacts = [
            {
              id: generateUUID(),
              contactType: 'licence-holder',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct company contact', () => {
          const result = ContactsPresenter.go(company, companyContacts)

          expect(result.companyContacts).to.equal([
            {
              action: `/system/companies/${companyContacts[0].id}/licence-holder`,
              communicationType: 'Licence holder',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })

      describe('"returns-to"', () => {
        beforeEach(() => {
          companyContacts = [
            {
              id: generateUUID(),
              contactType: 'returns-to',
              contactName: 'Rachael Tyrell'
            }
          ]
        })

        it('returns the correct company contact', () => {
          const result = ContactsPresenter.go(company, companyContacts)

          expect(result.companyContacts).to.equal([
            {
              action: `/system/companies/${companyContacts[0].id}/returns-to`,
              communicationType: 'Returns to',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })
    })
  })
})
