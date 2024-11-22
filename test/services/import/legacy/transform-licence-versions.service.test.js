'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const FetchLicenceVersionsService = require('../../../../app/services/import/legacy/fetch-licence-versions.service.js')

// Thing under test
const TransformLicenceVersionsService = require('../../../../app/services/import/legacy/transform-licence-versions.service.js')

describe('Import Legacy Transform Licence Versions service', () => {
  // NOTE: Clearly this is an incomplete representation of the licence returned from TransformedLicenceService. But for
  // the purposes of this service it is all that is needed
  const transformedLicence = { licenceVersions: [] }

  const naldLicenceId = '2113'
  const regionCode = '6'

  let legacyLicenceVersion

  beforeEach(() => {
    legacyLicenceVersion = _legacyLicenceVersion()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a matching valid legacy licence version is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceVersionsService, 'go').resolves([legacyLicenceVersion])
    })

    it('attaches the record transformed and validated for WRLS to the transformed licence', async () => {
      await TransformLicenceVersionsService.go(regionCode, naldLicenceId, transformedLicence)

      expect(transformedLicence.licenceVersions[0]).to.equal({
        endDate: null,
        externalId: '6:2113:100:0',
        increment: 0,
        issue: 100,
        licenceVersionPurposes: [],
        startDate: new Date('1999-01-01'),
        status: 'current'
      })
    })
  })

  describe('when no matching legacy licence version is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceVersionsService, 'go').resolves(null)
    })

    it('throws an error', async () => {
      await expect(TransformLicenceVersionsService.go(regionCode, naldLicenceId, transformedLicence)).to.reject()
    })
  })

  describe('when the matching legacy licence version is invalid', () => {
    beforeEach(() => {
      legacyLicenceVersion.increment_number = null

      Sinon.stub(FetchLicenceVersionsService, 'go').resolves([legacyLicenceVersion])
    })

    it('throws an error', async () => {
      await expect(TransformLicenceVersionsService.go(regionCode, naldLicenceId, transformedLicence)).to.reject()
    })
  })
})

function _legacyLicenceVersion() {
  return {
    effective_end_date: null,
    effective_start_date: new Date('1999-01-01'),
    external_id: '6:2113:100:0',
    increment_number: 0,
    issue_no: 100,
    status: 'CURR'
  }
}
