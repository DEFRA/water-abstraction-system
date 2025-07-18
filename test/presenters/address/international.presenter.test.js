'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { countries } = require('../../../app/lib/static-lookups.lib.js')

// Thing under test
const InternationalPresenter = require('../../../app/presenters/address/international.presenter.js')

describe('Address - International Presenter', () => {
  let session

  describe('when called with an empty address object', () => {
    beforeEach(async () => {
      session = {
        id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
        address: {}
      }
    })

    it('returns page data for the view', () => {
      const result = InternationalPresenter.go(session)

      expect(result).to.equal({
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        backLink: `/system/address/${session.id}/postcode`,
        country: _countries(),
        pageTitle: 'Enter the international address',
        postcode: null
      })
    })
  })

  describe('when called with an address object', () => {
    beforeEach(async () => {
      session = {
        id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
        address: {
          international: {
            addressLine1: '1 Fake Farm',
            addressLine2: '1 Fake street',
            addressLine3: 'Fake Village',
            addressLine4: 'Fake City',
            country: 'England',
            postcode: 'SW1A 1AA'
          }
        }
      }
    })
    it('returns page data for the view', () => {
      const result = InternationalPresenter.go(session)

      expect(result).to.equal({
        addressLine1: '1 Fake Farm',
        addressLine2: '1 Fake street',
        addressLine3: 'Fake Village',
        addressLine4: 'Fake City',
        backLink: `/system/address/${session.id}/postcode`,
        country: _countries('England'),
        pageTitle: 'Enter the international address',
        postcode: 'SW1A 1AA'
      })
    })
  })
})

function _countries(savedCountry) {
  const displayCountries = countries.map((country) => {
    return {
      value: country,
      selected: savedCountry === country,
      text: country
    }
  })

  displayCountries.unshift({
    value: 'select',
    selected: savedCountry !== 'select',
    text: 'Select a country'
  })

  return displayCountries
}
