'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const DatabaseSupport = require('../../support/database.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const SendBillRunService = require('../../../app/services/bill-runs/send-bill-run.service.js')

describe('Send Bill Run service', () => {
  let billRunId
  let region

  beforeEach(async () => {
    await DatabaseSupport.clean()

    region = RegionHelper.select()
    const billRun = await BillRunHelper.add({
      billRunNumber: 10101,
      createdAt: new Date('2024-02-28'),
      externalId: 'f54e53f0-37a0-400f-9f0e-bf8575c17668',
      regionId: region.id,
      status: 'ready'
    })

    billRunId = billRun.id
  })

  describe('when a bill with a matching ID exists', () => {
    it('will fetch the data and format it for use in the send bill run page', async () => {
      const result = await SendBillRunService.go(billRunId)

      expect(result).to.equal({
        billRunId,
        billRunNumber: 10101,
        billRunStatus: 'ready',
        billRunType: 'Supplementary',
        chargeScheme: 'Current',
        dateCreated: '28 February 2024',
        financialYear: '2022 to 2023',
        region: region.displayName
      })
    })
  })

  describe('when a bill run with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(SendBillRunService.go('testId'))
        .to
        .reject()
    })
  })
})
