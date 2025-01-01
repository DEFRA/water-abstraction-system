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
const CreateService = require('../../../../app/services/bill-runs/setup/create.service.js')
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js')
const RegionModel = require('../../../../app/models/region.model.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/bill-runs/setup/submit-check.service.js')

describe('Bill Runs - Setup - Submit Check service', () => {
  const auth = {
    isValid: true,
    credentials: {
      user: { id: 123 },
      roles: ['billing', 'charge_version_workflow_editor'],
      groups: [],
      scope: ['billing', 'charge_version_workflow_editor'],
      permissions: { abstractionReform: false, billRuns: true, manage: true }
    }
  }
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let blockingResults
  let createStub
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({ data: { region: regionId, type: 'annual' } })
  })

  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    describe('and no blocking bill runs are found', () => {
      beforeEach(async () => {
        blockingResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.current }

        Sinon.stub(DetermineBlockingBillRunService, 'go').resolves(blockingResults)

        createStub = Sinon.stub(CreateService, 'go').resolves()
      })

      it('triggers creation of the bill run and returns empty page data', async () => {
        const result = await SubmitCheckService.go(session.id, auth)

        expect(createStub.called).to.be.true()
        expect(result).to.equal({})
      })
    })

    // NOTE: The only time we would expect this to happen, is if a user delayed confirming creation of the bill run long
    // enough for someone else to have kicked of another, that now blocks this one
    describe('and a blocking bill run is found', () => {
      beforeEach(async () => {
        blockingResults = {
          matches: [
            {
              id: 'c0608545-9870-4605-a407-5ff49f8a5182',
              batchType: 'annual',
              billRunNumber: 12345,
              createdAt: new Date('2024-05-01'),
              region: { id: '292fe1c3-c9d4-47dd-a01b-0ac916497af5', displayName: 'Stormlands' },
              scheme: 'sroc',
              status: 'sent',
              summer: false,
              toFinancialYearEnding: 2025
            }
          ],
          toFinancialYearEnding: 2025,
          trigger: engineTriggers.neither
        }

        Sinon.stub(DetermineBlockingBillRunService, 'go').resolves(blockingResults)

        Sinon.stub(RegionModel, 'query').returns({
          select: Sinon.stub().returnsThis(),
          findById: Sinon.stub().withArgs(regionId).resolves({ id: regionId, displayName: 'Stormlands' })
        })
      })

      it('returns page data needed to re-render the view', async () => {
        const result = await SubmitCheckService.go(session.id, auth)

        expect(result).to.equal({
          error: true,
          backLink: `/system/bill-runs/setup/${session.id}/region`,
          billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
          billRunNumber: 12345,
          billRunStatus: 'sent',
          billRunType: 'Annual',
          chargeScheme: 'Current',
          dateCreated: '1 May 2024',
          financialYear: '2024 to 2025',
          pageTitle: 'This bill run already exists',
          regionName: 'Stormlands',
          sessionId: session.id,
          showCreateButton: false,
          warningMessage: 'You can only have one Annual bill run per region in a financial year'
        })
      })
    })
  })

  afterEach(() => {
    Sinon.restore()
  })
})
