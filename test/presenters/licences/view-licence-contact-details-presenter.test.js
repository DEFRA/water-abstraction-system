'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceContactDetailsPresenter =
  require('../../../app/presenters/licences/view-licence-contact-details.presenter')

describe('View Licence contact details presenter', () => {
  describe('when provided with a licence contacts data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceContactDetailsPresenter.go(_LicenceContacts())

      expect(result).to.equal({
        activeTab: 'contact-details',
        customerId: '562e7ec4-eb9f-4d4b-9f4b-8005020fb50a',
        licenceContacts: [
          {
            address: {
              address1: 'Air House',
              address2: 'Open Road',
              address3: 'Farmers yard',
              address4: null,
              country: null,
              postcode: 'BS1 5TL'
            },
            communicationType: 'Returns',
            name: 'Jackie Flow'
          },
          {
            address: {
              address1: 'Water House',
              address2: 'Liquid Road',
              address3: null,
              address4: null,
              country: null,
              postcode: 'BS1 5TL'
            },
            communicationType: 'Licence Holder',
            name: 'Water Services Ltd'
          }
        ]
      }
      )
    })

    it('uses the contact first and last name if available', () => {
      const result = ViewLicenceContactDetailsPresenter.go(_LicenceContacts())

      expect(result.licenceContacts[0].name).to.equal('Jackie Flow')
    })

    it('uses the contact company name if no contact names are available', () => {
      const result = ViewLicenceContactDetailsPresenter.go(_LicenceContacts())

      expect(result.licenceContacts[1].name).to.equal('Water Services Ltd')
    })

    it('finds the customerId', () => {
      const result = ViewLicenceContactDetailsPresenter.go(_LicenceContacts())

      expect(result.customerId).to.equal('562e7ec4-eb9f-4d4b-9f4b-8005020fb50a')
    })

    it('handles not finding a customerId', () => {
      const contacts = _LicenceContacts()
      contacts.licenceContacts[1].company = null
      const result = ViewLicenceContactDetailsPresenter.go(contacts)

      expect(result.customerId).to.be.null()
    })
  })
})

function _LicenceContacts () {
  return {
    licenceContacts: [
      {
        contact: {
          firstName: 'Jackie',
          lastName: 'Flow'
        },
        licenceRole: {
          name: 'returnsTo',
          label: 'Returns'
        },
        company: {
          id: '6d861a7a-d639-4851-acf7-04481dcdafe5',
          name: 'Ms Jackie Flow'
        },
        address: {
          address1: 'Air House',
          address2: 'Open Road',
          address3: 'Farmers yard',
          address4: null,
          country: null,
          postcode: 'BS1 5TL'
        }
      },
      {
        contact: null,
        licenceRole: {
          name: 'licenceHolder',
          label: 'Licence Holder'
        },
        company: {
          id: '562e7ec4-eb9f-4d4b-9f4b-8005020fb50a',
          name: 'Water Services Ltd'
        },
        address: {
          address1: 'Water House',
          address2: 'Liquid Road',
          address3: null,
          address4: null,
          country: null,
          postcode: 'BS1 5TL'
        }
      }
    ]
  }
}
