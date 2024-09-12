'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')

// Thing under test
const CheckBusyBillRunsService = require('../../../app/services/bill-runs/check-busy-bill-runs.service.js')

describe('Check Busy Bill Runs service', () => {
  beforeEach(async () => {
    await BillRunModel.query().delete()

    // We always add a bill run that is not 'busy' to confirm the service is differentiating between 'busy' and
    // 'not busy'.
    await BillRunHelper.add({ status: 'ready' })
  })

  describe('when there are both building and cancelling bill runs', () => {
    beforeEach(async () => {
      await BillRunHelper.add({ status: 'cancel' })
      await BillRunHelper.add({ status: 'processing' })
    })

    it('returns "both"', async () => {
      const result = await CheckBusyBillRunsService.go()

      expect(result).to.equal('both')
    })
  })

  describe('when there are cancelling bill runs', () => {
    beforeEach(async () => {
      await BillRunHelper.add({ status: 'cancel' })
    })

    it('returns "cancelling"', async () => {
      const result = await CheckBusyBillRunsService.go()

      expect(result).to.equal('cancelling')
    })
  })

  describe('when there are building bill runs', () => {
    describe('because their status is "processing"', () => {
      beforeEach(async () => {
        await BillRunHelper.add({ status: 'processing' })
      })

      it('returns "building"', async () => {
        const result = await CheckBusyBillRunsService.go()

        expect(result).to.equal('building')
      })
    })

    describe('because their status is "queued"', () => {
      beforeEach(async () => {
        await BillRunHelper.add({ status: 'queued' })
      })

      it('returns "building"', async () => {
        const result = await CheckBusyBillRunsService.go()

        expect(result).to.equal('building')
      })
    })

    describe('because their status is "sending"', () => {
      beforeEach(async () => {
        await BillRunHelper.add({ status: 'sending' })
      })

      it('returns "building"', async () => {
        const result = await CheckBusyBillRunsService.go()

        expect(result).to.equal('building')
      })
    })
  })

  describe('when there are no building or cancelling bill runs', () => {
    it('returns "none"', async () => {
      const result = await CheckBusyBillRunsService.go()

      expect(result).to.equal('none')
    })
  })
})
