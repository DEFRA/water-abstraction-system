'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const LicenceContactsPresenter = require('../../../app/presenters/licences/licence-contacts.presenter.js')

describe('Licence Contacts presenter', () => {
  let licenceContacts

  beforeEach(() => {
    licenceContacts = [
      {
        communicationType: 'Licence Holder',
        companyId: 'ebe95a21-c6f6-4f15-8856-a48ffc737731',
        companyName: 'Acme ltd',
        contactId: null,
        firstName: null,
        lastName: null,
        address1: '34 Eastgate',
        address2: null,
        address3: null,
        address4: null,
        address5: null,
        address6: null,
        postcode: 'CF71 7DG',
        country: 'United Kingdom'
      }
    ]
  })

  describe('when provided with populated licence contacts data', () => {
    it('correctly presents the data', () => {
      const result = LicenceContactsPresenter.go(licenceContacts)

      expect(result).to.equal({
        customerId: 'ebe95a21-c6f6-4f15-8856-a48ffc737731',
        licenceContacts: [{
          address: {
            address1: '34 Eastgate',
            address2: null,
            address3: null,
            address4: null,
            address5: null,
            address6: null,
            country: 'United Kingdom',
            postcode: 'CF71 7DG'
          },
          communicationType: 'Licence Holder',
          name: 'Acme ltd'
        }]
      })
    })

    describe('the "customerId" property', () => {
      describe('when one of the licence contacts has the communication type of "Licence Holder"', () => {
        it("returns that licence contact's company Id", () => {
          const result = LicenceContactsPresenter.go(licenceContacts)

          expect(result.customerId).to.equal('ebe95a21-c6f6-4f15-8856-a48ffc737731')
        })
      })

      describe('when none of the licence contacts has the communication type of "Licence Holder"', () => {
        beforeEach(() => {
          licenceContacts[0].communicationType = 'Returns'
        })

        it('returns null', () => {
          const result = LicenceContactsPresenter.go(licenceContacts)

          expect(result.customerId).to.be.null()
        })
      })
    })

    describe('the "licenceContacts.name" property', () => {
      describe('when the licence contact does not have a contact', () => {
        it("returns the licence contact's company name", () => {
          const result = LicenceContactsPresenter.go(licenceContacts)

          expect(result.licenceContacts[0].name).to.equal('Acme ltd')
        })
      })

      describe('when the licence contact has a contact with a last name', () => {
        beforeEach(() => {
          licenceContacts[0].contactId = '0a4ebb93-2e90-4e35-acd5-a5aa73466508'
          licenceContacts[0].lastName = 'Flow'
        })

        describe('but no first name', () => {
          it("returns just the licence contact's last name", () => {
            const result = LicenceContactsPresenter.go(licenceContacts)

            expect(result.licenceContacts[0].name).to.equal('Flow')
          })
        })

        describe('and a first name', () => {
          beforeEach(() => {
            licenceContacts[0].firstName = 'Jackie'
          })

          it("returns the licence contact's first and last name", () => {
            const result = LicenceContactsPresenter.go(licenceContacts)

            expect(result.licenceContacts[0].name).to.equal('Jackie Flow')
          })
        })
      })
    })
  })
})
