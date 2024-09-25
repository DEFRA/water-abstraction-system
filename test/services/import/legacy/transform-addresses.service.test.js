'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things to stub
const FetchAddressesService = require('../../../../app/services/import/legacy/fetch-address.service.js')

// Thing under test
const TransformAddressesService = require('../../../../app/services/import/legacy/transform-addresses.service.js')

describe('Import Legacy Transform Addresses service', () => {
  const naldLicenceId = '2113'
  const regionCode = '1'

  let legacyAddress
  let transformedCompanies

  beforeEach(() => {
    transformedCompanies = [{ externalId: '1:007' }]

    legacyAddress = _legacyAddress()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when matching valid legacy address is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchAddressesService, 'go').resolves([legacyAddress])
    })

    it('attaches the record transformed and validated for WRLS to the transformed company', async () => {
      await TransformAddressesService
        .go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({
        addresses: [
          {
            address1: '4 Privet Drive',
            address2: null,
            address3: null,
            address4: null,
            address5: 'Little Whinging',
            address6: 'Surrey',
            country: 'United Kingdom',
            externalId: '7:777',
            postcode: 'HP11',
            dataSource: 'nald'
          }
        ],
        externalId: '1:007'
      })
    })
  })

  describe('when no matching valid legacy address is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchAddressesService, 'go').resolves([])
    })

    it('returns no contact object on the company', async () => {
      await TransformAddressesService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({ externalId: '1:007' })
    })
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
    company_external_id: '1:007',
    country: 'United Kingdom',
    external_id: '7:777',
    postcode: 'HP11'
  }
}
