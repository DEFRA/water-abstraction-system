'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Thing under test
const CleanEmptyBillRunsService = require('../../../../app/services/jobs/clean/clean-empty-bill-runs.service.js')

describe('Jobs - Clean - Clean Empty Bill Runs service', () => {
  let billRun

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the clean is successful', () => {
    describe('when there is an "empty" bill run', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ status: 'empty' })
      })

      it('removes the empty bill run', async () => {
        await CleanEmptyBillRunsService.go()

        const results = await BillRunModel.query().whereIn('id', [billRun.id])

        expect(results).to.have.length(0)
      })
    })

    describe('when the bill run is not flagged as "empty"', () => {
      beforeEach(async () => {
        billRun = await BillRunHelper.add({ status: 'processing' })
      })

      it('does not remove the empty bill run', async () => {
        await CleanEmptyBillRunsService.go()

        const results = await BillRunModel.query().whereIn('id', [billRun.id])

        expect(results).to.have.length(1)
      })
    })
  })

  describe('when the clean errors', () => {
    beforeEach(() => {
      Sinon.stub(BillRunModel, 'query').returns({
        delete: Sinon.stub().returnsThis(),
        where: Sinon.stub().rejects()
      })
    })

    it('throws an error', async () => {
      await expect(CleanEmptyBillRunsService.go()).to.reject()
    })
  })
})
