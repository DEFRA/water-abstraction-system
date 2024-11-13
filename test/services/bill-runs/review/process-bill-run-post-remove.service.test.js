'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const ReviewLicenceModel = require('../../../../app/models/review-licence.model.js')

// Thing under test
const ProcessBillRunPostRemoveService = require('../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js')

describe('Bill Runs Review - Process Bill Run Post Remove service', () => {
  const billRunId = 'd4b76592-8f98-4064-892c-399ff83928f7'

  let billRunPatchStub

  beforeEach(() => {
    billRunPatchStub = Sinon.stub().resolves()
    Sinon.stub(BillRunModel, 'query').returns({
      findById: Sinon.stub().withArgs(billRunId).returnsThis(),
      patch: billRunPatchStub
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the bill run contains no licences (it is now empty)', () => {
      beforeEach(() => {
        Sinon.stub(ReviewLicenceModel, 'query').returns({
          select: Sinon.stub().withArgs('id').returnsThis(),
          where: Sinon.stub().withArgs('billRunId', billRunId).returnsThis(),
          resultSize: Sinon.stub().resolves(0)
        })
      })

      it('sets the status of the bill run to empty and returns "true"', async () => {
        const result = await ProcessBillRunPostRemoveService.go(billRunId)

        expect(result).to.be.true()

        // Check we set the bill run status
        const [patchObject] = billRunPatchStub.args[0]

        expect(patchObject).to.equal({ status: 'empty' })
      })
    })

    describe('and the bill run still contains licences', () => {
      beforeEach(() => {
        Sinon.stub(ReviewLicenceModel, 'query').returns({
          select: Sinon.stub().withArgs('id').returnsThis(),
          where: Sinon.stub().withArgs('billRunId', billRunId).returnsThis(),
          resultSize: Sinon.stub().resolves(1)
        })
      })

      it('does not change the bill run status status and returns "false"', async () => {
        const result = await ProcessBillRunPostRemoveService.go(billRunId)

        expect(result).to.be.false()

        // Check we not change the bill run status
        expect(billRunPatchStub.called).to.be.false()
      })
    })
  })
})
