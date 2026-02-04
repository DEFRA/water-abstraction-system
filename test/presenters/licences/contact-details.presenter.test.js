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
        companyId,
        customerContactLink: `/system/companies/${companyId}/contacts`,
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

    describe('the "companyId" property', () => {
      describe('when one of the contacts has the communication type of "Licence Holder"', () => {
        it("returns that contact's company Id", () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.companyId).to.equal(companyId)
        })
      })

      describe('when none of the contacts has the communication type of "Licence Holder"', () => {
        beforeEach(() => {
          contacts[0].communicationType = 'Returns'
        })

        it('returns null', () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.companyId).to.be.null()
        })
      })
    })

    describe('the "customerContactLink" property', () => {
      describe('when the "enableCustomerView" feature toggle is enabled', () => {
        it('correctly presents the data', () => {
          const result = ContactDetailsPresenter.go(contacts, licence)

          expect(result.customerContactLink).to.equal(`/system/companies/${companyId}/contacts`)
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
