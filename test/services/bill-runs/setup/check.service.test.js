'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js')
const RegionModel = require('../../../../app/models/region.model.js')

// Thing under test
const CheckService = require('../../../../app/services/bill-runs/setup/check.service.js')

describe('Bill Runs - Setup - Check service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { region: regionId, type: 'annual' } })

    Sinon.stub(DetermineBlockingBillRunService, 'go').resolves({
      matches: [],
      toFinancialYearEnding: 2025,
      trigger: engineTriggers.current
    })

    Sinon.stub(RegionModel, 'query').returns({
      select: Sinon.stub().returnsThis(),
      findById: Sinon.stub().withArgs(regionId).resolves({ id: regionId, displayName: 'Avalon' })
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
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
        financialYear: '2024 to 2025',
        pageTitle: 'Check the bill run to be created',
        regionName: 'Avalon',
        sessionId: session.id,
        showCreateButton: true,
        warningMessage: null
      })
    })
  })
})
