'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const AssignBillRunToLicencesService = require('../../../../app/services/bill-runs/assign-bill-run-to-licences.service.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const GenerateBillRunService = require('../../../../app/services/bill-runs/tpt-supplementary/generate-bill-run.service.js')
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const MatchAndAllocateService = require('../../../../app/services/bill-runs/match/match-and-allocate.service.js')

// Thing under test
const ProcessBillRunService = require('../../../../app/services/bill-runs/tpt-supplementary/process-bill-run.service.js')

describe('Bill Runs - TPT Supplementary - Process Bill Run service', () => {
  const billingPeriods = [{ startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') }]
  const billRun = { id: '410c84a5-39d3-441a-97ca-6104e14d00a2' }

  let billRunPatchStub
  let generateBillRunStub
  let notifierStub

  beforeEach(async () => {
    billRunPatchStub = Sinon.stub().resolves()

    Sinon.stub(BillRunModel, 'query').returns({
      findById: Sinon.stub().returnsThis(),
      patch: billRunPatchStub
    })

    generateBillRunStub = Sinon.stub(GenerateBillRunService, 'go')

    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      Sinon.stub(AssignBillRunToLicencesService, 'go').resolves()
    })

    describe('and no licences are matched and allocated', () => {
      beforeEach(() => {
        Sinon.stub(MatchAndAllocateService, 'go').resolves(false)
        generateBillRunStub.resolves()
      })

      it('sets the bill run status only to "processing"', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(billRunPatchStub.calledOnce).to.be.true()
        expect(billRunPatchStub.firstCall.firstArg).to.equal({ status: 'processing' })
      })

      it('skips to "generating" the bill run', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(generateBillRunStub.calledOnce).to.be.true()
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).to.equal('Process bill run complete')
        expect(args[1].timeTakenMs).to.exist()
        expect(args[1].billRunId).to.equal(billRun.id)
        expect(args[1].type).to.equal('two_part_supplementary')
      })
    })

    describe('and licences are matched and allocated', () => {
      beforeEach(() => {
        // NOTE: ProcessBillRunService orchestrates the creation of a bill run. The actual work is done in the services
        // it is calling. As long as MatchAndAllocateService returns a 'licence', ProcessBillRunService will trigger the
        // work to happen. This is why for these tests it is not critical what we stub MatchAndAllocateService to
        // return, only that it returns something!
        Sinon.stub(MatchAndAllocateService, 'go').resolves(true)
      })

      it('sets the bill run status first to "processing" and then to "review"', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(billRunPatchStub.calledTwice).to.be.true()
        expect(billRunPatchStub.firstCall.firstArg).to.equal({ status: 'processing' })
        expect(billRunPatchStub.secondCall.firstArg).to.equal({ status: 'review' })
      })

      it('does not skip to "generating" the bill run', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(generateBillRunStub.called).to.be.false()
      })

      it('logs the time taken', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omg.firstCall.args

        expect(args[0]).to.equal('Process bill run complete')
        expect(args[1].timeTakenMs).to.exist()
        expect(args[1].billRunId).to.equal(billRun.id)
        expect(args[1].type).to.equal('two_part_supplementary')
      })
    })
  })

  describe('when the service errors', () => {
    describe('because assigning the bill run to the licences fails', () => {
      beforeEach(() => {
        Sinon.stub(AssignBillRunToLicencesService, 'go').rejects()
        Sinon.stub(HandleErroredBillRunService, 'go')
      })

      it('calls HandleErroredBillRunService', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(HandleErroredBillRunService.go.called).to.be.true()
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Process bill run failed')
        expect(args[1].billRun.id).to.equal(billRun.id)
        expect(args[2]).to.be.an.error()
      })
    })

    describe('because matching and allocating fails', () => {
      beforeEach(() => {
        Sinon.stub(AssignBillRunToLicencesService, 'go').resolves()
        Sinon.stub(MatchAndAllocateService, 'go').rejects()
        Sinon.stub(HandleErroredBillRunService, 'go')
      })

      it('calls HandleErroredBillRunService', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(HandleErroredBillRunService.go.called).to.be.true()
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Process bill run failed')
        expect(args[1].billRun.id).to.equal(billRun.id)
        expect(args[2]).to.be.an.error()
      })
    })
  })
})
