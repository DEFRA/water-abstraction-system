'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { countries } = require('../../../app/lib/static-lookups.lib.js')

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const InternationalService = require('../../../app/services/address/international.service.js')

describe('Address - International Service', () => {
  let session
  let sessionData

  describe('when called with no saved address', () => {
    beforeEach(async () => {
      sessionData = {
        address: {}
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await InternationalService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
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

  describe('when called with the entire address saved', () => {
    beforeEach(async () => {
      sessionData = {
        address: {
          addressLine1: '1 Fake Farm',
          addressLine2: '1 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          country: 'England',
          postcode: 'SW1A 1AA'
        }
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await InternationalService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
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

function _countries(value = 'select') {
  const displayCountries = countries.map((country) => {
    return {
      value: country,
      selected: value === country,
      text: country
    }
  })

  displayCountries.unshift({
    value: 'select',
    selected: value === 'select',
    text: 'Select a country'
  })

  return displayCountries
}
