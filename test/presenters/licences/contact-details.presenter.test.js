'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test Helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ContactDetailsPresenter = require('../../../app/presenters/licences/contact-details.presenter.js')

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
        id: generateUUID(),
        contactType: 'additional-contact',
        contactName: 'Rachael Tyrell'
      },
      {
        id: companyId,
        contactType: 'licence-holder',
        contactName: 'Eldon Tyrell'
      }
    ]

    Sinon.stub(FeatureFlagsConfig, 'enableCustomerView').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with populated contacts data', () => {
    it('correctly presents the data', () => {
      const result = ContactDetailsPresenter.go(contacts, licence)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        customerContactLink: `/system/companies/${companyId}/contacts`,
        contacts: [
          {
            action: `/system/company-contacts/${contacts[0].id}`,
            name: 'Rachael Tyrell',
            type: 'Additional contact'
          },
          {
            action: `/system/companies/${companyId}/licence-holder`,
            name: 'Eldon Tyrell',
            type: 'Licence holder'
          }
        ],
        pageTitle: 'Contact details',
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })

    describe('the "customerContactLink" property', () => {
      describe('when the the licence has a "licence Holder" licence contact', () => {
        it('returns the link to customer contacts', () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.customerContactLink).to.equal(`/system/companies/${companyId}/contacts`)
        })
      })

      describe('when the the licence does not have a "licence Holder" licence contact', () => {
        beforeEach(() => {
          contacts.pop()
        })

        it('returns null', () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.customerContactLink).to.be.null()
        })
      })
    })

    describe('and there is a contact with the type', () => {
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
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.contacts).to.equal([
            {
              action: `/system/company-contacts/${contacts[0].id}`,
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
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.contacts).to.equal([
            {
              action: `/system/company-contacts/${contacts[0].id}`,
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
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.contacts).to.equal([
            {
              action: `/system/billing-accounts/${contacts[0].id}?licence-id=${licence.id}`,
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
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.contacts).to.equal([
            {
              action: `/system/users/external/${contacts[0].id}`,
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
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.contacts).to.equal([
            {
              action: `/system/users/external/${contacts[0].id}`,
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
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.contacts).to.equal([
            {
              action: `/system/users/external/${contacts[0].id}`,
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
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.contacts).to.equal([
            {
              action: `/system/companies/${contacts[0].id}/licence-holder`,
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
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.contacts).to.equal([
            {
              action: `/system/companies/${contacts[0].id}/returns-to`,
              type: 'Returns to',
              name: 'Rachael Tyrell'
            }
          ])
        })
      })
    })
  })
})
