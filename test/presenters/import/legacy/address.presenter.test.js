'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AddressPresenter = require('../../../../app/presenters/import/legacy/address.presenter.js')

describe('Import Legacy Contact presenter', () => {
  let legacyAddress

  beforeEach(() => {
    legacyAddress = _legacyAddress()
  })

  it('correctly transforms the data', () => {
    const result = AddressPresenter.go(legacyAddress)

    expect(result).to.equal({
      address1: '4 Privet Drive',
      address2: null,
      address3: null,
      address4: null,
      country: 'United Kingdom',
      county: 'Surrey',
      externalId: '7:7777',
      postcode: 'HP11',
      town: 'Little Whinging'
    })
  })
})

function _legacyAddress () {
  return {
    address1: '4 Privet Drive',
    address2: null,
    address3: null,
    address4: null,
    town: 'Little Whinging',
    county: 'Surrey',
    postcode: 'HP11',
    country: 'United Kingdom',
    external_id: '7:7777'
  }
}
