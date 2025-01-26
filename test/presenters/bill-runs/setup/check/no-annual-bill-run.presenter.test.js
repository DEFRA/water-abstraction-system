'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NoAnnualBillRunPresenter = require('../../../../../app/presenters/bill-runs/setup/check/no-annual-bill-run.presenter.js')

describe('Bill Runs - Setup - No Annual Bill Run presenter', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'

  let session

  beforeEach(() => {
    session = {
      id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
      region: regionId,
      regionName: 'Avalon',
      type: 'supplementary'
    }
  })

  describe('when provided with a bill run setup session record where the financial year end could not be determined', () => {
    it('correctly presents the data', () => {
      const result = NoAnnualBillRunPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
        billRunLink: null,
        billRunNumber: null,
        billRunStatus: null,
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: null,
        financialYear: null,
        pageTitle: 'This bill run is blocked',
        regionName: session.regionName,
        sessionId: session.id,
        showCreateButton: false,
        warningMessage:
          'You cannot create a supplementary bill run for this region until you have created an annual bill run'
      })
    })
  })
})
