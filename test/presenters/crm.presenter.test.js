'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../app/lib/general.lib.js')

// Thing under test
const CRMPresenter = require('../../app/presenters/crm.presenter.js')

describe('CRM presenter', () => {
  let contact

  beforeEach(() => {
    contact = {
      // Name
      type: 'Person',
      salutation: 'Mr',
      initials: 'B T',
      forename: 'Bruce',
      name: 'Wayne',
      // Address
      addressLine1: 'Wayne Manor',
      addressLine2: null,
      addressLine3: '',
      addressLine4: undefined,
      town: 'Gotham City',
      county: 'Gotham County',
      postcode: '10001',
      country: 'USA',
      // Role
      role: 'Licence holder'
    }
  })

  describe('#contactDetails()', () => {
    describe('when given multiple valid contacts', () => {
      it('correctly returns the contact details', () => {
        const result = CRMPresenter.contactDetails([contact])
        expect(result).to.equal([
          {
            address: ['Wayne Manor', 'Gotham City', 'Gotham County', '10001', 'USA'],
            name: 'Mr B T Wayne',
            role: 'Licence holder'
          }
        ])
      })
    })
  })

  describe('#contactAddress()', () => {
    describe('when given an address', () => {
      it('correctly returns the address, with only the required fields and no falsey values', () => {
        const result = CRMPresenter.contactAddress(contact)

        expect(result).to.equal(['Wayne Manor', 'Gotham City', 'Gotham County', '10001', 'USA'])
      })
    })
  })

  describe('#contactName()', () => {
    describe('when the "type" is "Person"', () => {
      describe('and they have initials', () => {
        it('correctly formats the name to use the initials', () => {
          const result = CRMPresenter.contactName(contact)

          expect(result).to.equal('Mr B T Wayne')
        })
      })

      describe('and they have initials and a forename', () => {
        it('correctly formats the name to use the initials', () => {
          const result = CRMPresenter.contactName(contact)

          expect(result).to.equal('Mr B T Wayne')
        })
      })

      describe('and they have a forename and no initials', () => {
        beforeEach(() => {
          contact.initials = null
        })

        it('correctly formats the name to use the forename', () => {
          const result = CRMPresenter.contactName(contact)

          expect(result).to.equal('Mr Bruce Wayne')
        })
      })

      describe('when the "type" is "person" (lower case contact type)', () => {
        beforeEach(() => {
          contact.type = 'person'
        })

        it('correctly formats the "person"', () => {
          const result = CRMPresenter.contactName(contact)

          expect(result).to.equal('Mr B T Wayne')
        })
      })

      describe('when there is no contact "type"', () => {
        beforeEach(() => {
          delete contact.type
        })

        it('correctly formats the name', () => {
          const result = CRMPresenter.contactName(contact)

          expect(result).to.equal('Wayne')
        })
      })
    })

    describe('when the "type" is not "person"', () => {
      describe('and they have initals', () => {
        beforeEach(() => {
          contact.type = 'Organisation'
          contact.name = 'ACME Ltd'
        })

        it('correctly formats the name to use the initals', () => {
          const result = CRMPresenter.contactName(contact)

          expect(result).to.equal('ACME Ltd')
        })
      })
    })
  })

  describe('#formatContact()', () => {
    describe('When there is a contact with the type', () => {
      let contact

      describe('"abstraction-alerts"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'abstraction-alerts',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/company-contacts/${contact.id}/contact-details`,
            type: 'Abstraction alerts',
            name: 'Rachael Tyrell'
          })
        })
      })

      describe('"additional-contact"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'additional-contact',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/company-contacts/${contact.id}/contact-details`,
            type: 'Additional contact',
            name: 'Rachael Tyrell'
          })
        })
      })

      describe('"billing"', () => {
        const companyId = generateUUID()

        const billingQueryArgs = {
          'company-id': companyId
        }

        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'billing',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact, billingQueryArgs)

          expect(result).to.equal({
            link: `/system/billing-accounts/${contact.id}?company-id=${companyId}`,
            type: 'Billing',
            name: 'Rachael Tyrell'
          })
        })
      })

      describe('"basic-user"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'basic-user',
            contactName: 'user@test.com'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/users/external/${contact.id}`,
            type: 'Basic user',
            name: 'user@test.com'
          })
        })
      })

      describe('"primary-user"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'primary-user',
            contactName: 'user@test.com'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/users/external/${contact.id}`,
            type: 'Primary user',
            name: 'user@test.com'
          })
        })
      })

      describe('"returns-user"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'returns-user',
            contactName: 'user@test.com'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/users/external/${contact.id}`,
            type: 'Returns user',
            name: 'user@test.com'
          })
        })
      })

      describe('"licence-holder"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'licence-holder',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/companies/${contact.id}/licence-holder`,
            type: 'Licence holder',
            name: 'Rachael Tyrell'
          })
        })
      })

      describe('"returns-to"', () => {
        beforeEach(() => {
          contact = {
            id: generateUUID(),
            contactType: 'returns-to',
            contactName: 'Rachael Tyrell'
          }
        })

        it('returns the correct contact', () => {
          const result = CRMPresenter.formatContact(contact)

          expect(result).to.equal({
            link: `/system/companies/${contact.id}/returns-to`,
            type: 'Returns to',
            name: 'Rachael Tyrell'
          })
        })
      })
    })
  })

  describe('#filteredContactDetailsByRole()', () => {
    describe('when given multiple valid contacts', () => {
      let invalidContact
      beforeEach(() => {
        invalidContact = {
          ...contact,
          role: 'Butler'
        }
      })

      it('correctly returns the filtered contact details', () => {
        const result = CRMPresenter.filteredContactDetailsByRole([contact, invalidContact])
        expect(result).to.equal([
          {
            address: ['Wayne Manor', 'Gotham City', 'Gotham County', '10001', 'USA'],
            name: 'Mr B T Wayne',
            role: 'Licence holder'
          }
        ])
      })
    })
  })
})
