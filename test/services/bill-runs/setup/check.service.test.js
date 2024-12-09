'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const ExistsService = require('../../../../app/services/bill-runs/setup/exists.service.js')
const RegionModel = require('../../../../app/models/region.model.js')

// Thing under test
const CheckService = require('../../../../app/services/bill-runs/setup/check.service.js')

describe('Bill Runs Setup Check service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { region: regionId, type: 'annual' } })

    Sinon.stub(ExistsService, 'go').resolves({ matches: [], toFinancialYearEnding: 2025 })

    Sinon.stub(RegionModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      findById: Sinon.stub().withArgs(regionId).resolves({ id: regionId, displayName: 'Avalon' })
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckService.go(session.id)

      expect(result).to.equal({
        backLink: `/system/bill-runs/setup/${session.id}/region`,
        billRunLink: null,
        billRunNumber: null,
        billRunStatus: null,
        billRunType: 'Annual',
        chargeScheme: 'Current',
        dateCreated: null,
        exists: false,
        financialYear: '2024 to 2025',
        pageTitle: 'Check the bill run to be created',
        regionName: 'Avalon',
        sessionId: session.id,
        warningMessage: null
      })
    })
  })
})
