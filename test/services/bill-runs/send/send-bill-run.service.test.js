'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const BillRunModel = require('../../../../app/models/bill-run.model.js')

// Thing under test
const SendBillBunService = require('../../../../app/services/bill-runs/send/send-bill-run.service.js')

describe('Bill Runs - Send Bill Run service', () => {
  let billRun
  let queryStub
  let billRunPatchStub

  beforeEach(() => {
    billRunPatchStub = Sinon.stub().resolves()

    queryStub = Sinon.stub(BillRunModel, 'query')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the bill run exists', () => {
    describe('and can be sent', () => {
      beforeEach(() => {
        billRun = _billRun()

        queryStub.onFirstCall().returns({
          findById: Sinon.stub().withArgs(billRun.id).returnsThis(),
          select: Sinon.stub().withArgs('id', 'externalId', 'status').resolves(billRun)
        })

        queryStub.onSecondCall().returns({
          findById: Sinon.stub().withArgs(billRun.id).returnsThis(),
          patch: billRunPatchStub
        })
      })

      it('sets the status of the bill run to "sending"', async () => {
        await SendBillBunService.go(billRun.id)

        // Check we set the bill run status
        const [patchObject] = billRunPatchStub.args[0]

        expect(patchObject).to.equal({ status: 'sending' }, { skip: ['updatedAt'] })
      })

      it('returns an instance of the bill run with its status set to "sending"', async () => {
        const result = await SendBillBunService.go(billRun.id)

        expect(result).to.equal({ ...billRun, status: 'sending' })
      })
    })

    describe('but cannot be sent because of its status', () => {
      beforeEach(async () => {
        billRun = _billRun()
        billRun.status = 'sent'

        queryStub.onFirstCall().returns({
          findById: Sinon.stub().withArgs(billRun.id).returnsThis(),
          select: Sinon.stub().withArgs('id', 'externalId', 'status').resolves(billRun)
        })
      })

      it('does not change the bill run status', async () => {
        await SendBillBunService.go(billRun.id)

        // Check we do not change the bill run status
        expect(billRunPatchStub.called).to.be.false()
      })

      it('returns an instance of the bill run with its status unchanged', async () => {
        const result = await SendBillBunService.go(billRun.id)

        expect(result).to.equal(billRun)
      })
    })
  })

  describe('when the bill run does not exist', () => {
    it('throws as error', async () => {
      await expect(SendBillBunService.go('47e66de7-f05f-42d2-8fef-640b55150919')).to.reject()
    })
  })
})

function _billRun() {
  return {
    batchType: 'annual',
    createdAt: new Date('2024-05-07'),
    externalId: 'c5d64590-a0c9-45ee-b381-ab1ddb569751',
    id: '20f530db-aa69-42d1-8a27-0ab838ca1916',
    scheme: 'sroc',
    status: 'ready'
  }
}
