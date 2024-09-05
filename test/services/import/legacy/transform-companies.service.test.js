'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things to stub
const FetchCompanyService = require('../../../../app/services/import/legacy/fetch-company.service.js')

// Thing under test
const TransformCompaniesService = require('../../../../app/services/import/legacy/transform-companies.service.js')

describe('Import Legacy Transform Companies service', () => {
  const naldLicenceId = '2113'
  const regionCode = '1'

  let legacyCompany

  beforeEach(() => {
    legacyCompany = _legacyCompany()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when matching valid legacy companies are found', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyService, 'go').resolves([legacyCompany])
    })

    it('returns the companies and the companies transformed and validated for WRLS', async () => {
      const result = await TransformCompaniesService.go(regionCode, naldLicenceId)

      expect(result).to.equal({
        companies: [
          {
            name: 'ACME',
            type: 'organisation',
            external_id: '1:1938',
            salutation: 'Mr',
            firstname: 'Martin',
            lastname: 'Keeble',
            party_id: '1938',
            address_id: '1868'
          }
        ],
        transformedCompanies: [
          {
            externalId: '1:1938',
            name: 'ACME',
            type: 'organisation'
          }
        ]
      })
    })
  })

  describe('when matching valid legacy companies are found with duplicate external ids ', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyService, 'go').resolves([legacyCompany, legacyCompany])
    })

    it('returns the companies and the companies transformed and validated for WRLS with no duplicates', async () => {
      const result = await TransformCompaniesService.go(regionCode, naldLicenceId)

      expect(result.transformedCompanies).to.equal(
        [{
          externalId: '1:1938',
          name: 'ACME',
          type: 'organisation'
        }])
    })
  })

  describe('when no matching valid legacy companies are found', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyService, 'go').resolves([])
    })

    it('returns an empty array', async () => {
      const result = await TransformCompaniesService.go(regionCode, naldLicenceId)

      expect(result.transformedCompanies).to.equal([])
    })
  })
})

function _legacyCompany () {
  return {
    name: 'ACME',
    type: 'organisation',
    external_id: '1:1938',
    salutation: 'Mr',
    firstname: 'Martin',
    lastname: 'Keeble',
    party_id: '1938',
    address_id: '1868'
  }
}
