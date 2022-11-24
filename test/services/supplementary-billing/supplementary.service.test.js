'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')
const FetchRegionService = require('../../../app/services/supplementary-billing/fetch-region.service.js')

// Thing under test
const SupplementaryService = require('../../../app/services/supplementary-billing/supplementary.service.js')

describe('Supplementary service', () => {
  beforeEach(async () => {
    Sinon.stub(FetchRegionService, 'go').resolves({ regionId: 'bd114474-790f-4470-8ba4-7b0cc9c225d7' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are licences to be included in supplementary billing', () => {
    const testRecords = [{
      chargeVersionId: '4b5cbe04-a0e2-468c-909e-1e2d93810ba8',
      scheme: 'sroc',
      endDate: null,
      licenceId: '2627a306-23a3-432f-9c71-a71663888285',
      licenceRef: 'AT/SROC/SUPB/01'
    }]

    beforeEach(async () => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves(testRecords)
    })

    it('returns only the current SROC charge versions that are applicable', async () => {
      const result = await SupplementaryService.go('regionId')

      expect(result.chargeVersions.length).to.equal(1)
      expect(result.chargeVersions[0].chargeVersionId).to.equal(testRecords[0].chargeVersionId)
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
