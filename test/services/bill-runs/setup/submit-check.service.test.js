// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { engineTriggers } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import * as CreateService from '../../../../app/services/bill-runs/setup/create.service.js'
import * as DeleteSessionDal from '../../../../app/dal/delete-session.dal.js'
import * as DetermineBlockingBillRunService from '../../../../app/services/bill-runs/setup/determine-blocking-bill-run.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitCheckService from '../../../../app/services/bill-runs/setup/submit-check.service.js'

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
  let session

  beforeEach(async () => {
    session = { id: sessionId, region: region.id, regionName: region.displayName, type: 'annual' }

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and no blocking bill runs are found', () => {
      beforeEach(async () => {
        blockingResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.current }

        vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue(blockingResults)

        vi.spyOn(CreateService, 'default').mockResolvedValue()
      })

      it('triggers creation of the bill run and returns empty page data', async () => {
        const result = await SubmitCheckService(session.id, auth)

        expect(CreateService.default).toHaveBeenCalled()
        expect(result).toEqual({})
      })

      it('deletes the session data', async () => {
        await SubmitCheckService(session.id, auth)

        expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
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

        vi.spyOn(DetermineBlockingBillRunService, 'default').mockResolvedValue(blockingResults)
      })

      it('returns page data needed to re-render the view', async () => {
        const result = await SubmitCheckService(session.id, auth)

        expect(result).toEqual({
          activeNavBar: 'bill-runs',
          error: true,
          backLink: `/system/bill-runs/setup/${session.id}/region`,
          billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
          billRunNumber: 12345,
          billRunStatus: 'sent',
          billRunType: 'Annual',
          chargeScheme: 'Current',
          dateCreated: '1 May 2024',
          financialYearEnd: 2025,
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
    vi.restoreAllMocks()
  })
})
