'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const AddressPresenter = require('../../../../app/presenters/import/legacy/address.presenter.js')

describe('Import Legacy Address presenter', () => {
  let legacyAddress

  const dateSource = 'nald'

  beforeEach(() => {
    legacyAddress = _legacyAddress()
  })

  it('correctly transforms the data', () => {
    const result = AddressPresenter.go(legacyAddress, dateSource)

    expect(result).to.equal({
      address1: '4 Privet Drive',
      address2: null,
      address3: null,
      address4: null,
      address5: 'Little Whinging',
      address6: 'Surrey',
      country: 'United Kingdom',
      externalId: '7:7777',
      postcode: 'HP11',
      dataSource: 'nald'
    })
  })

  it('correctly sets the data source provided', () => {
    const result = AddressPresenter.go(legacyAddress, dateSource)

    expect(result.dataSource).to.equal('nald')
  })
})

function _legacyAddress () {
  return {
    address1: '4 Privet Drive',
    address2: null,
    address3: null,
    address4: null,
    address5: 'Little Whinging',
    address6: 'Surrey',
    postcode: 'HP11',
    country: 'United Kingdom',
    external_id: '7:7777'
  }
}
