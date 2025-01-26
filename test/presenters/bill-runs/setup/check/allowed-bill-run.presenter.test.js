'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { engineTriggers } = require('../../../../../app/lib/static-lookups.lib.js')

// Thing under test
const AllowedBillRunPresenter = require('../../../../../app/presenters/bill-runs/setup/check/allowed-bill-run.presenter.js')

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
      const result = AllowedBillRunPresenter.go(session, blockingResults)

      expect(result).to.equal({
        backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
        billRunLink: null,
        billRunNumber: null,
        billRunStatus: null,
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: null,
        financialYear: '2024 to 2025',
        pageTitle: 'Check the bill run to be created',
        regionName: session.regionName,
        sessionId: session.id,
        showCreateButton: true,
        warningMessage: null
      })
    })
  })
})
