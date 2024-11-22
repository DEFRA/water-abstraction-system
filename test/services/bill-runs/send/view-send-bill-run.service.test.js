'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Thing under test
const ViewSendBillRunService = require('../../../../app/services/bill-runs/send/view-send-bill-run.service.js')

describe('Bill Runs - View Send Bill Run service', () => {
  const billRunId = 'd351ee81-157e-4621-98eb-db121cb48cbb'

  let billRunQueryStub

  beforeEach(async () => {
    billRunQueryStub = Sinon.stub()

    Sinon.stub(BillRunModel, 'query').returns({
      findById: Sinon.stub().withArgs(billRunId).returnsThis(),
      select: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis(),
      modifyGraph: billRunQueryStub
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill with a matching ID exists', () => {
    beforeEach(() => {
      billRunQueryStub.resolves({
        batchType: 'annual',
        billRunNumber: 10101,
        createdAt: new Date('2024-02-28'),
        id: billRunId,
        region: {
          displayName: 'Avalon',
          id: 'a1b202f3-0673-4358-82ab-6c39c7f183fb'
        },
        scheme: 'sroc',
        status: 'ready',
        summer: false,
        toFinancialYearEnding: 2025
      })
    })

    it('will fetch the data and format it for use in the send bill run page', async () => {
      const result = await ViewSendBillRunService.go(billRunId)

      expect(result).to.equal({
        billRunId,
        billRunNumber: 10101,
        billRunStatus: 'ready',
        billRunType: 'Annual',
        chargeScheme: 'Current',
        dateCreated: '28 February 2024',
        financialYear: '2024 to 2025',
        region: 'Avalon'
      })
    })
  })

  describe('when a bill run with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(ViewSendBillRunService.go('testId'))
        .to
        .reject()
    })
  })
})
