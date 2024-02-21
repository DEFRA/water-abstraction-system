'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CancelBillRunConfirmationPresenter = require('../../../app/presenters/bill-runs/cancel-bill-run-confirmation.presenter.js')

describe.only('Cancel Bill Run Confirmation presenter', () => {
  describe('when there is data to be presented', () => {
    const testBillRun = {
      createdAt: new Date('2024-02-21'),
      toFinancialYearEnding: 2023,
      batchType: 'two_part_tariff',
      externalId: 'f54e53f0-37a0-400f-9f0e-bf8575c17668',
      region: { displayName: 'Avalon' }
    }

    it('correctly presents the data', () => {
      const result = CancelBillRunConfirmationPresenter.go(testBillRun)

      expect(result).to.equal({
        dateCreated: '21 February 2024',
        region: 'Avalon',
        billRunType: 'two-part tariff',
        financialYear: '2022 to 2023',
        billRunBatchType: 'two_part_tariff',
        chargingModuleBillRunId: 'f54e53f0-37a0-400f-9f0e-bf8575c17668'
      })
    })
  })
})
