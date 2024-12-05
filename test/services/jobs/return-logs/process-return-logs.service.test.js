'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CreateCurrentReturnCycleService = require('../../../../app/services/jobs/return-logs/create-current-return-cycle.service.js')
const CreateReturnLogsService = require('../../../../app/services/return-logs/create-return-logs.service.js')
const FetchCurrentReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-current-return-cycle.service.js')
const FetchReturnRequirementsService = require('../../../../app/services/jobs/return-logs/fetch-return-requirements.service.js')

// Thing under test
const ProcessReturnLogsService = require('../../../../app/services/jobs/return-logs/process-return-logs.service.js')

describe('Process return logs service', () => {
  const cycle = 'all-year'

  let createReturnCycleStub
  let createReturnLogsStub
  let notifierStub

  beforeEach(() => {
    createReturnLogsStub = Sinon.stub(CreateReturnLogsService, 'go').resolves()
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

  describe('when the requested return cycle exists', () => {
    beforeEach(() => {
      Sinon.stub(FetchCurrentReturnCycleService, 'go').resolves(_returnCycle())
      createReturnCycleStub = Sinon.stub(CreateCurrentReturnCycleService, 'go').resolves()
    })

    describe('and there are return requirements that need return logs created', () => {
      beforeEach(() => {
        Sinon.stub(FetchReturnRequirementsService, 'go').resolves([_returnRequirement()])
      })

      it('does not create a new return cycle', async () => {
        await ProcessReturnLogsService.go(cycle)

        expect(createReturnCycleStub.called).to.be.false()
      })

      it('creates the return logs', async () => {
        await ProcessReturnLogsService.go(cycle)

        expect(createReturnLogsStub.called).to.be.true()
      })

      it('logs the time taken in milliseconds and seconds', async () => {
        await ProcessReturnLogsService.go(cycle)

        const logDataArg = notifierStub.omg.firstCall.args[1]

        expect(notifierStub.omg.calledWith('Return logs job complete')).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.timeTakenSs).to.exist()
        expect(logDataArg.count).to.equal(1)
        expect(logDataArg.cycle).to.equal(cycle)
      })
    })

    describe('but there are no return requirements that need return logs created', () => {
      beforeEach(() => {
        Sinon.stub(FetchReturnRequirementsService, 'go').resolves([])
      })

      it('does not create any return logs', async () => {
        await ProcessReturnLogsService.go(cycle)

        expect(createReturnCycleStub.called).to.be.false()
      })

      it('still logs the time taken in milliseconds and seconds', async () => {
        await ProcessReturnLogsService.go(cycle)

        const logDataArg = notifierStub.omg.firstCall.args[1]

        expect(notifierStub.omg.calledWith('Return logs job complete')).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.timeTakenSs).to.exist()
        expect(logDataArg.count).to.equal(0)
        expect(logDataArg.cycle).to.equal(cycle)
      })
    })
  })

  describe('when the requested return cycle does not exist', () => {
    beforeEach(() => {
      Sinon.stub(FetchCurrentReturnCycleService, 'go').resolves()
      createReturnCycleStub = Sinon.stub(CreateCurrentReturnCycleService, 'go').resolves(_returnCycle())
    })

    describe('and there are return requirements that need return logs created', () => {
      beforeEach(() => {
        Sinon.stub(FetchReturnRequirementsService, 'go').resolves([_returnRequirement()])
      })

      it('creates a new return cycle', async () => {
        await ProcessReturnLogsService.go(cycle)

        expect(createReturnCycleStub.called).to.be.true()
      })

      it('creates the return logs', async () => {
        await ProcessReturnLogsService.go(cycle)

        expect(createReturnLogsStub.called).to.be.true()
      })

      it('logs the time taken in milliseconds and seconds', async () => {
        await ProcessReturnLogsService.go(cycle)

        const logDataArg = notifierStub.omg.firstCall.args[1]

        expect(notifierStub.omg.calledWith('Return logs job complete')).to.be.true()
        expect(logDataArg.timeTakenMs).to.exist()
        expect(logDataArg.timeTakenSs).to.exist()
        expect(logDataArg.count).to.equal(1)
        expect(logDataArg.cycle).to.equal(cycle)
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      Sinon.stub(FetchCurrentReturnCycleService, 'go').rejects()
    })

    it('handles the error', async () => {
      await ProcessReturnLogsService.go(cycle)

      const args = notifierStub.omfg.firstCall.args

      expect(args[0]).to.equal('Return logs job failed')
      expect(args[1]).to.equal({ cycle })
      expect(args[2]).to.be.an.error()
    })
  })
})

function _returnCycle() {
  return {
    id: '6889b98d-964f-4966-b6d6-bf511d6526a1',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    dueDate: new Date('2025-04-28'),
    summer: false,
    submittedInWrls: true
  }
}

function _returnRequirement() {
  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    externalId: '4:16999651',
    id: '4bc1efa7-10af-4958-864e-32acae5c6fa4',
    legacyId: 16999651,
    reportingFrequency: 'day',
    returnVersionId: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
    siteDescription: 'BOREHOLE AT AVALON',
    summer: false,
    twoPartTariff: false,
    upload: false,
    returnVersion: {
      endDate: null,
      id: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
      reason: 'new-licence',
      startDate: new Date('2022-04-01'),
      licence: {
        expiredDate: null,
        id: '3acf7d80-cf74-4e86-8128-13ef687ea091',
        lapsedDate: null,
        licenceRef: '01/25/90/3242',
        revokedDate: null,
        areacode: 'SAAR',
        region: {
          id: 'eb57737f-b309-49c2-9ab6-f701e3a6fd96',
          naldRegionId: 4
        }
      }
    },
    points: [
      {
        description: 'Winter cycle - live licence - live return version - winter return requirement',
        ngr1: 'TG 713 291',
        ngr2: null,
        ngr3: null,
        ngr4: null
      }
    ],
    returnRequirementPurposes: [
      {
        alias: 'Purpose alias for testing',
        id: '06c4c2f2-3dff-4053-bbc8-e6f64cd39623',
        primaryPurpose: {
          description: 'Agriculture',
          id: 'b6bb3b77-cfe8-4f22-8dc9-e92713ca3156',
          legacyId: 'A'
        },
        purpose: {
          description: 'General Farming & Domestic',
          id: '289d1644-5215-4a20-af9e-5664fa9a18c7',
          legacyId: '140'
        },
        secondaryPurpose: {
          description: 'General Agriculture',
          id: '2457bfeb-a120-4b57-802a-46494bd22f82',
          legacyId: 'AGR'
        }
      }
    ]
  }
}
