'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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
    describe('when the "type" is "person"', () => {
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
