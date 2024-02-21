'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Things we need to stub
const CancelBillRunConfirmationPresenter = require('../../../app/presenters/bill-runs/cancel-bill-run-confirmation.presenter.js')

// Thing under test
const CancelBillRunConfirmationService = require('../../../app/services/bill-runs/cancel-bill-run-confirmation.service.js')

describe('Cancel Bill Run Confirmation service', () => {
  let linkedRegion
  let testBillRun

  beforeEach(async () => {
    await DatabaseHelper.clean()

    // Create the initial bill run linked and associated region
    linkedRegion = await RegionHelper.add()
    testBillRun = await BillRunHelper.add({
      regionId: linkedRegion.id,
      externalId: 'f54e53f0-37a0-400f-9f0e-bf8575c17668'
    })
  })

  describe('when a bill run with a matching ID exists', () => {
    let CancelBillRunConfirmationPresenterStub
    beforeEach(async () => {
      CancelBillRunConfirmationPresenterStub = Sinon.stub(CancelBillRunConfirmationPresenter, 'go').resolves('pageData')
    })

    it('passes the bill run data to the presenter and returns the data for the confirmation page', async () => {
      const result = await CancelBillRunConfirmationService.go(testBillRun.id)

      const expectedBillRunData = {
        createdAt: testBillRun.createdAt,
        toFinancialYearEnding: testBillRun.toFinancialYearEnding,
        batchType: testBillRun.batchType,
        externalId: testBillRun.externalId,
        region: { displayName: linkedRegion.displayName }
      }
      const stubArgs = CancelBillRunConfirmationPresenterStub.args[0][0]

      expect(stubArgs).to.equal(expectedBillRunData)
      expect(result).to.equal('pageData')
    })
  })
})
