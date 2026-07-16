// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { engineTriggers } from '../../../../../app/lib/static-lookups.lib.js'

// Thing under test
import AllowedBillRunPresenter from '../../../../../app/presenters/bill-runs/setup/check/allowed-bill-run.presenter.js'

describe('Bill Runs - Setup - Allowed Bill Run presenter', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let blockingResults
  let session

  beforeEach(() => {
    session = {
      id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
      region: regionId,
      regionName: 'Avalon',
      type: 'supplementary'
    }
  })

  describe('when provided with a bill run setup session record where the bill run can be created', () => {
    beforeEach(() => {
      blockingResults = { toFinancialYearEnding: 2025, trigger: engineTriggers.both }
    })

    it('correctly presents the data', () => {
      const result = AllowedBillRunPresenter(session, blockingResults)

      expect(result).toEqual({
        backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
        billRunLink: null,
        billRunNumber: null,
        billRunStatus: null,
        billRunType: 'Supplementary',
        chargeScheme: 'Both',
        dateCreated: null,
        financialYearEnd: 2025,
        pageTitle: 'Check the bill run to be created',
        regionName: session.regionName,
        sessionId: session.id,
        showCreateButton: true,
        warningMessage: null
      })
    })
  })

  describe('the "chargeScheme" property', () => {
    describe('when both bill run types can be created (supplementary only)', () => {
      it('returns "Both"', () => {
        const result = AllowedBillRunPresenter(session, blockingResults)

        expect(result.chargeScheme).toEqual('Both')
      })
    })

    describe('when only an SROC bill run type can be created', () => {
      beforeEach(() => {
        blockingResults.trigger = engineTriggers.current
      })

      it('returns "Current"', () => {
        const result = AllowedBillRunPresenter(session, blockingResults)

        expect(result.chargeScheme).toEqual('Current')
      })
    })

    describe('when only a PRESROC bill run type can be created', () => {
      beforeEach(() => {
        blockingResults.trigger = engineTriggers.old
      })

      it('returns "Current"', () => {
        const result = AllowedBillRunPresenter(session, blockingResults)

        expect(result.chargeScheme).toEqual('Old')
      })
    })
  })
})
