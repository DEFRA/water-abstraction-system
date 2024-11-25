'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Thing under test
const CancelBillBunService = require('../../../../app/services/bill-runs/cancel/cancel-bill-run.service.js')

describe('Bill Runs - Cancel Bill Run service', () => {
  const billRunId = '20f530db-aa69-42d1-8a27-0ab838ca1916'
  const externalId = 'c5d64590-a0c9-45ee-b381-ab1ddb569751'

  let queryStub
  let billRunPatchStub

  beforeEach(() => {
    billRunPatchStub = Sinon.stub().resolves()

    queryStub = Sinon.stub(BillRunModel, 'query')

    queryStub.onSecondCall().returns({
      findById: Sinon.stub().withArgs(billRunId).returnsThis(),
      patch: billRunPatchStub
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the bill run exists', () => {
    describe('and can be deleted', () => {
      beforeEach(() => {
        queryStub.onFirstCall().returns({
          findById: Sinon.stub().withArgs(billRunId).returnsThis(),
          select: Sinon.stub()
            .withArgs('id', 'externalId', 'status')
            .resolves({ id: billRunId, externalId, status: 'ready' })
        })
      })

      it('sets the status of the bill run to "cancel"', async () => {
        await CancelBillBunService.go(billRunId)

        // Check we set the bill run status
        const [patchObject] = billRunPatchStub.args[0]

        expect(patchObject).to.equal({ status: 'cancel' }, { skip: ['updatedAt'] })
      })

      it('returns an instance of the bill run including its external ID and status set to "cancel"', async () => {
        const result = await CancelBillBunService.go(billRunId)

        expect(result).to.equal({ id: billRunId, externalId, status: 'cancel' })
      })
    })

    describe('but cannot be deleted because of its status', () => {
      beforeEach(async () => {
        queryStub.onFirstCall().returns({
          findById: Sinon.stub().withArgs(billRunId).returnsThis(),
          select: Sinon.stub()
            .withArgs('id', 'externalId', 'status')
            .resolves({ id: billRunId, externalId, status: 'sent' })
        })
      })

      it('does not change the bill run status', async () => {
        await CancelBillBunService.go(billRunId)

        // Check we do not change the bill run status
        expect(billRunPatchStub.called).to.be.false()
      })

      it('returns an instance of the bill run including its external ID and status unchanged', async () => {
        const result = await CancelBillBunService.go(billRunId)

        expect(result).to.equal({ id: billRunId, externalId, status: 'sent' })
      })
    })
  })

  describe('when the bill run does not exist', () => {
    it('throws as error', async () => {
      await expect(CancelBillBunService.go('47e66de7-f05f-42d2-8fef-640b55150919')).to.reject()
    })
  })
})
