'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const {
  returnCycle,
  returnCycles,
  returnRequirement,
  returnRequirementsAcrossReturnVersions
} = require('../../fixtures/return-logs.fixture.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Things we need to stub
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')

// Thing under test
const CreateReturnLogsService = require('../../../app/services/return-logs/create-return-logs.service.js')

describe('Return Logs - Create Return Logs service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let clock
  let notifierStub
  let testReturnCycle
  let testReturnRequirement

  beforeEach(() => {
    // BaseRequest depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
    delete global.GlobalNotifier
  })

  describe('when called', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

      testReturnCycle = returnCycle(true)
      testReturnRequirement = returnRequirement(true)
    })

    it('will persist the return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

      expect(results[0]).to.equal('v1:4:01/25/90/3242:16999652:2025-11-01:2026-10-31')
    })

    describe('and an error occurs when creating the return logs', () => {
      beforeEach(() => {
        // NOTE: We stub the generate service to throw purely because it is easier to structure our tests on that basis.
        // But if the actual insert were to throw the expected behaviour would be the same.
        Sinon.stub(GenerateReturnLogService, 'go').throws()
      })

      it('handles the error', async () => {
        await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Return logs creation errored')
        expect(args[1].returnRequirement.id).to.equal('3bc0e31a-4bfb-47ef-aa6e-8aca37d9aac2')
        expect(args[1].returnCycle.id).to.equal('4c5ff4dc-dfe0-4693-9cb5-acdebf6f76b8')
        expect(args[2]).to.be.an.error()
      })
    })
  })

  describe('when called with a quarterly return version and a return cycle after 01-04-2025', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date('2025-12-01'))

      testReturnCycle = returnCycle()
      testReturnRequirement = returnRequirement()
    })

    it('will persist the return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

      expect(results).to.equal([
        'v1:4:01/25/90/3242:16999651:2025-04-01:2025-06-30',
        'v1:4:01/25/90/3242:16999651:2025-07-01:2025-09-30',
        'v1:4:01/25/90/3242:16999651:2025-10-01:2025-12-31',
        'v1:4:01/25/90/3242:16999651:2026-01-01:2026-03-31'
      ])
    })

    describe('and an error occurs when creating the return logs', () => {
      beforeEach(() => {
        // NOTE: We stub the generate service to throw purely because it is easier to structure our tests on that basis.
        // But if the actual insert were to throw the expected behaviour would be the same.
        Sinon.stub(GenerateReturnLogService, 'go').throws()
      })

      it('handles the error', async () => {
        await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Return logs creation errored')
        expect(args[1].returnRequirement.id).to.equal('4bc1efa7-10af-4958-864e-32acae5c6fa4')
        expect(args[1].returnCycle.id).to.equal('6889b98d-964f-4966-b6d6-bf511d6526a9')
        expect(args[2]).to.be.an.error()
      })
    })
  })

  describe('when called with a quarterly return version with a licence end date that ends during the return cycle', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date('2025-05-01'))

      testReturnCycle = returnCycles()[1]
      testReturnRequirement = returnRequirementsAcrossReturnVersions()[4]
      testReturnRequirement.returnVersion.endDate = null
      testReturnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
    })

    it('will persist the valid return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle, new Date('2025-05-01'))

      expect(results[0]).to.equal('v1:4:01/25/90/3242:16999643:2025-04-01:2025-05-01')
    })
  })

  describe('when called with a quarterly return version with a return version end date that ends during the return cycle', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date('2025-05-01'))

      testReturnCycle = returnCycles()[1]
      testReturnRequirement = returnRequirementsAcrossReturnVersions()[4]
      testReturnRequirement.returnVersion.endDate = new Date('2025-05-01')
      testReturnRequirement.legacyId = 16999611
    })

    it('will persist the valid return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle, new Date('2025-05-01'))

      expect(results[0]).to.equal('v1:4:01/25/90/3242:16999611:2025-04-01:2025-05-01')
    })
  })

  describe('when called with a quarterly return version with a licence start date that starts during the return cycle', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

      testReturnCycle = returnCycles()[1]
      testReturnRequirement = returnRequirementsAcrossReturnVersions()[5]
    })

    it('will persist the valid return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

      expect(results).to.equal([
        'v1:4:01/25/90/3242:16999644:2025-07-27:2025-09-30',
        'v1:4:01/25/90/3242:16999644:2025-10-01:2025-12-31',
        'v1:4:01/25/90/3242:16999644:2026-01-01:2026-03-31'
      ])
    })
  })

  describe('when called with a quarterly return version and a return cycle before 01-04-2025', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

      testReturnCycle = returnCycles(6)[5]
      testReturnRequirement = returnRequirement()
    })

    it('returns only one return log', async () => {
      const results = await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

      expect(results).to.equal(['v1:4:01/25/90/3242:16999651:2023-04-01:2024-03-31'])
    })
  })

  describe('when called with an existing return log already exists and a return cycle before 01-04-2025', () => {
    beforeEach(async () => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

      testReturnCycle = returnCycles(6)[5]
      testReturnRequirement = returnRequirement()
      testReturnRequirement.returnReference = 16999621
      await ReturnLogHelper.add({
        id: 'v1:4:01/25/90/3242:16999621:2023-04-01:2024-03-31',
        licenceRef: '01/25/90/3242',
        endDate: new Date('2024-03-31'),
        returnReference: '16999621',
        startDate: new Date('2023-04-01')
      })
    })

    it('returns only one return log', async () => {
      const results = await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

      expect(results).to.equal([])
    })
  })
})
