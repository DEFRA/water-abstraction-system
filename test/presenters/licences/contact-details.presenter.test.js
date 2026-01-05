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
        communicationType: 'Licence Holder',
        companyId,
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
        customerId: companyId,
        customerContactLink: `/system/customers/${companyId}/contacts`,
        licenceContacts: [
          {
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
          }
        ],
        pageTitle: 'Contact details',
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })

    describe('the "customerId" property', () => {
      describe('when one of the contacts has the communication type of "Licence Holder"', () => {
        it("returns that contact's company Id", () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.customerId).to.equal(companyId)
        })
      })

      describe('when none of the contacts has the communication type of "Licence Holder"', () => {
        beforeEach(() => {
          contacts[0].communicationType = 'Returns'
        })

        it('returns null', () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.customerId).to.be.null()
        })
      })
    })

    describe('the "licenceContacts.name" property', () => {
      describe('when the contact does not have a contact', () => {
        it("returns the contact's company name", () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.licenceContacts[0].name).to.equal('Acme ltd')
        })
      })

      describe('when the contact has a contact with a last name', () => {
        beforeEach(() => {
          contacts[0].contactId = '0a4ebb93-2e90-4e35-acd5-a5aa73466508'
          contacts[0].lastName = 'Flow'
        })

        describe('but no first name', () => {
          it("returns just the contact's last name", () => {
            const result = ContactDetailsPresenter.go(contacts, licence)

            expect(result.licenceContacts[0].name).to.equal('Flow')
          })
        })

        describe('and a first name', () => {
          beforeEach(() => {
            contacts[0].firstName = 'Jackie'
          })

          it("returns the contact's first and last name", () => {
            const result = ContactDetailsPresenter.go(contacts, licence)

            expect(result.licenceContacts[0].name).to.equal('Jackie Flow')
          })
        })
      })
    })

    describe('the "customerContactLink" property', () => {
      describe('when the "enableCustomerView" feature toggle is enabled', () => {
        it('correctly presents the data', () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.customerContactLink).to.equal(`/system/customers/${companyId}/contacts`)
        })
      })

      describe('when the "enableCustomerView" feature toggle is disabled', () => {
        beforeEach(() => {
          Sinon.stub(FeatureFlagsConfig, 'enableCustomerView').value(false)
        })

        it('correctly presents the data', () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.customerContactLink).to.equal(`/customer/${companyId}/#contacts`)
        })
      })
    })
  })
})
