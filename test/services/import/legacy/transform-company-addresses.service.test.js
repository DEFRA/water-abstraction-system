'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things to stub
const FetchCompanyAddressesService = require('../../../../app/services/import/legacy/fetch-company-address.service.js')

// Thing under test
const TransformCompanyAddressesService = require('../../../../app/services/import/legacy/transform-company-addresses.service.js')

describe('Import Legacy Transform Company Addresses service', () => {
  const naldLicenceId = '2113'
  const regionCode = '1'
  const licenceRoleId = generateUUID()

  let legacyLicenceHolderAddress
  let transformedCompanies

  beforeEach(() => {
    transformedCompanies = [{ externalId: '1:007', companyAddresses: [] }]

    legacyLicenceHolderAddress = _legacyLicenceHolderCompanyAddress(licenceRoleId)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when matching valid legacy address for a licence version is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyAddressesService, 'go').resolves([legacyLicenceHolderAddress])
    })

    it('attaches the record transformed and validated for WRLS to the transformed company', async () => {
      await TransformCompanyAddressesService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({
        companyAddresses: [
          {
            addressId: '7:777',
            companyId: '1:007',
            endDate: null,
            licenceRoleId,
            startDate: new Date('2020-01-01')
          }
        ],
        externalId: '1:007'
      })
    })
  })

  describe('when no matching valid legacy address for a licence version is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyAddressesService, 'go').resolves([])
    })

    it('returns no contact object on the company', async () => {
      await TransformCompanyAddressesService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({ externalId: '1:007', companyAddresses: [] })
    })
  })
})

function _legacyLicenceHolderCompanyAddress(licenceRoleId) {
  return {
    company_external_id: '1:007',
    external_id: '7:777',
    start_date: new Date('2020-01-01'),
    end_date: null,
    licence_role_id: licenceRoleId,
    revoked_date: null,
    expired_date: null,
    lapsed_date: null,
    licence_role_name: 'licenceHolder'
  }
}
