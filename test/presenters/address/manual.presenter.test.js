'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ManualPresenter = require('../../../app/presenters/address/manual.presenter.js')

describe('Address - Manual Presenter', () => {
  const address = {
    addressLine1: '1 Fake appartment',
    addressLine2: '1 Fake street',
    town: 'Fake Town',
    county: 'Fake County',
    postcode: 'SW1A 1AA'
  }

  describe('when called with an empty address object', () => {
    it('returns page data for the view', () => {
      const result = ManualPresenter.go({})

      expect(result).to.equal({
        pageTitle: 'Enter the address'
      })
    })
  })

  describe('when called with an address object', () => {
    it('returns page data for the view', () => {
      const result = ManualPresenter.go(address)

      expect(result).to.equal({
        pageTitle: 'Enter the address',
        addressLine1: '1 Fake appartment',
        addressLine2: '1 Fake street',
        town: 'Fake Town',
        county: 'Fake County',
        postcode: 'SW1A 1AA'
      })
    })
  })
})
