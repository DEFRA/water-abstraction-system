'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things to stub
const FetchLicenceHolderService = require('../../../../app/services/import/legacy/fetch-licence-holders.service.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const TransformLicenceHolderService = require('../../../../app/services/import/legacy/transform-licence-holder.service.js')

describe('Import Legacy Transform Licence Holder service', () => {
  // NOTE: Clearly this is an incomplete representation of the company returned from TransformedCompaniesService.
  // But for the purposes of this service it is all that is needed
  const transformedCompany = { externalId: '1:007' }

  const naldLicenceId = '007'
  const regionCode = '1'

  let legacyLicenceHolder
  let licenceRoleId
  let transformedCompanies

  beforeEach(() => {
    licenceRoleId = generateUUID()

    legacyLicenceHolder = _legacyLicenceHolder(licenceRoleId)

    transformedCompanies = [{ ...transformedCompany }]
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when matching valid legacy licence holder is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceHolderService, 'go').resolves([legacyLicenceHolder])
    })

    it('returns the companies with the licence holder transformed and validated for WRLS', async () => {
      await TransformLicenceHolderService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies).to.equal([
        {
          externalId: '1:007',
          licenceHolder: {
            companyExternalId: '1:007',
            contactExternalId: '1:007',
            licenceRoleId,
            startDate: new Date('2001-01-01')
          }
        }
      ])
    })
  })

  describe('when no matching valid legacy licence holders are found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceHolderService, 'go').resolves([])
    })

    it('returns no licence holder on the company', async () => {
      await TransformLicenceHolderService.go(regionCode, naldLicenceId, transformedCompanies)

      expect(transformedCompanies[0]).to.equal({ externalId: '1:007' })
    })
  })
})

function _legacyLicenceHolder (licenceRoleId) {
  return {
    company_external_id: '1:007',
    contact_external_id: '1:007',
    start_date: new Date('2001-01-01'),
    licence_role_id: licenceRoleId
  }
}
