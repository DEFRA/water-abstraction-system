'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchChargeVersionsService = require('../../../app/services/supplementary_billing/fetch_charge_versions.service.js')

// Thing under test
const SupplementaryService = require('../../../app/services/supplementary_billing/supplementary.service.js')

describe('Supplementary service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are licences to be included in supplementary billing', () => {
    const testRecords = [{ charge_version_id: '878bc903-836d-4549-83f5-4e20ccf87d2f' }]
    beforeEach(async () => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves(testRecords)
    })

    it('returns only the current SROC charge versions that are applicable', async () => {
      const result = await SupplementaryService.go('regionId')

      expect(result.chargeVersions.length).to.equal(1)
      expect(result.chargeVersions[0].charge_version_id).to.equal(testRecords[0].charge_version_id)
    })
  })

  describe('when there are no licences to be included in supplementary billing', () => {
    beforeEach(async () => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
    })

    it('returns no charge versions', async () => {
      const result = await SupplementaryService.go('regionId')

      expect(result.chargeVersions).to.be.empty()
    })
  })
})
