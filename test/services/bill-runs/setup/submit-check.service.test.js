'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const CreateService = require('../../../../app/services/bill-runs/setup/create.service.js')
const DetermineBlockingBillRunService = require('../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js')
const SessionModel = require('../../../../app/models/session.model.js')

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
  const region = { id: '292fe1c3-c9d4-47dd-a01b-0ac916497af5', displayName: 'Avalon' }
  const sessionId = '4bcb28c5-95ae-487c-8f13-ac71ec3c5ff6'

  let blockingResults
  let createStub
  let session

  beforeEach(async () => {
    session = { id: sessionId, region: region.id, regionName: region.displayName, type: 'annual' }

    Sinon.stub(SessionModel, 'query').returns({
      findById: Sinon.stub().withArgs(sessionId).resolves(session)
    })
  })

  afterEach(() => {
    Sinon.restore()
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
              region,
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
      })

      it('returns page data needed to re-render the view', async () => {
        const result = await SubmitCheckService.go(session.id, auth)

        expect(result).to.equal({
          activeNavBar: 'bill-runs',
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
          regionName: 'Avalon',
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
