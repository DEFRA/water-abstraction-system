'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicenceContactDetailsPresenter = require('../../../app/presenters/licences/view-licence-contact-details.presenter')

describe('View Licence Bills presenter', () => {
  describe('when provided with a bills data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceContactDetailsPresenter.go(_contacts())

      expect(result).to.equal({
        activeTab: 'contact-details',
        contacts: {
          customers: [],
          licences: []
        }
      })
    })
  })
})

function _contacts () {
  return {
    customerContacts: [],
    licenceContacts: []
  }
}
