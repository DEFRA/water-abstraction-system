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

// Things we need to stub
const HandleErroredBillRunService = require('../../../../app/services/bill-runs/handle-errored-bill-run.service.js')
const MatchAndAllocateService = require('../../../../app/services/bill-runs/match/match-and-allocate.service.js')

// Thing under test
const ProcessBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/process-bill-run.service.js')

describe('Bill Runs - Two Part Tariff - Process Bill Run service', () => {
  const billingPeriods = [{ startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }]

  let billRun
  let notifierStub

  beforeEach(async () => {
    billRun = await BillRunHelper.add()

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
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
    describe('and there are no licences to be billed', () => {
      beforeEach(() => {
        Sinon.stub(MatchAndAllocateService, 'go').resolves([])
      })

      it('sets the Bill Run status to empty', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('empty')
      })
    })

    describe('and there are licences to be billed', () => {
      beforeEach(() => {
        // NOTE: ProcessBillRunService orchestrates the creation of a bill run. The actual work is done in the services
        // it is calling. As long as MatchAndAllocateService returns a 'licence', ProcessBillRunService will trigger the
        // work to happen. This is why for these tests it is not critical what we stub MatchAndAllocateService to
        // return, only that it returns something!
        Sinon.stub(MatchAndAllocateService, 'go').resolves([{ id: '27e16528-bf00-459e-9980-902feb84a054' }])
      })

      it('sets the Bill Run status to review', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const result = await BillRunModel.query().findById(billRun.id)

        expect(result.status).to.equal('review')
      })
    })
  })

  describe('when the service errors', () => {
    describe('because matching and allocating fails', () => {
      beforeEach(() => {
        Sinon.stub(MatchAndAllocateService, 'go').throws('MatchAndAllocateService has gone pop')
        Sinon.stub(HandleErroredBillRunService, 'go')
      })

      it('calls HandleErroredBillRunService', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        expect(HandleErroredBillRunService.go.called).to.be.true()
      })

      it('logs the error', async () => {
        await ProcessBillRunService.go(billRun, billingPeriods)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Bill run process errored')
        expect(args[1].billRun.id).to.equal(billRun.id)
        expect(args[2]).to.be.an.error()
        expect(args[2].name).to.equal('MatchAndAllocateService has gone pop')
      })
    })
  })
})
