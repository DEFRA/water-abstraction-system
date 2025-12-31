'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnCyclesFixture = require('../../fixtures/return-cycles.fixture.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnRequirementsFixture = require('../../fixtures/return-requirements.fixture.js')
const { today } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')

// Thing under test
const CreateReturnLogsService = require('../../../app/services/return-logs/create-return-logs.service.js')

describe('Return Logs - Create Return Logs service', () => {
  const todaysDate = today()
  const year = todaysDate.getFullYear()

  let clock
  let notifierStub
  let returnCycle
  let returnRequirement

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

      returnCycle = ReturnCyclesFixture.returnCycle(true)
      returnRequirement = ReturnRequirementsFixture.summerReturnRequirement()
    })

    it('will persist the return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

      const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

      expect(results[0]).to.equal(`${returnLogPrefix}:2025-11-01:2026-10-31`)
    })

    describe('and an error occurs when creating the return logs', () => {
      beforeEach(() => {
        // NOTE: We stub the generate service to throw purely because it is easier to structure our tests on that basis.
        // But if the actual insert were to throw the expected behaviour would be the same.
        Sinon.stub(GenerateReturnLogService, 'go').throws()
      })

      it('handles the error', async () => {
        await CreateReturnLogsService.go(returnRequirement, returnCycle)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Return logs creation errored')
        expect(args[1].returnRequirement.id).to.equal(returnRequirement.id)
        expect(args[1].returnCycle.id).to.equal('4c5ff4dc-dfe0-4693-9cb5-acdebf6f76b8')
        expect(args[2]).to.be.an.error()
      })
    })
  })

  describe('when called with a quarterly return version and a return cycle after 01-04-2025', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date('2025-12-01'))

      returnCycle = ReturnCyclesFixture.returnCycle()
      returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
    })

    it('will persist the return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

      const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

      expect(results).to.equal([
        `${returnLogPrefix}:2025-04-01:2025-06-30`,
        `${returnLogPrefix}:2025-07-01:2025-09-30`,
        `${returnLogPrefix}:2025-10-01:2025-12-31`,
        `${returnLogPrefix}:2026-01-01:2026-03-31`
      ])
    })

    describe('and an error occurs when creating the return logs', () => {
      beforeEach(() => {
        // NOTE: We stub the generate service to throw purely because it is easier to structure our tests on that basis.
        // But if the actual insert were to throw the expected behaviour would be the same.
        Sinon.stub(GenerateReturnLogService, 'go').throws()
      })

      it('handles the error', async () => {
        await CreateReturnLogsService.go(returnRequirement, returnCycle)

        const args = notifierStub.omfg.firstCall.args

        expect(args[0]).to.equal('Return logs creation errored')
        expect(args[1].returnRequirement.id).to.equal(returnRequirement.id)
        expect(args[1].returnCycle.id).to.equal('6889b98d-964f-4966-b6d6-bf511d6526a9')
        expect(args[2]).to.be.an.error()
      })
    })
  })

  describe('when called with a quarterly return version with a licence end date that ends during the return cycle', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date('2025-05-01'))

      returnCycle = ReturnCyclesFixture.returnCycles()[1]
      returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
      returnRequirement.returnVersion.endDate = null
      returnRequirement.returnVersion.licence.expiredDate = new Date('2025-05-01')
    })

    it('will persist the valid return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(returnRequirement, returnCycle, new Date('2025-05-01'))

      const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

      expect(results[0]).to.equal(`${returnLogPrefix}:2025-04-01:2025-05-01`)
    })
  })

  describe('when called with a quarterly return version with an end date that ends during the return cycle', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date('2025-05-01'))

      returnCycle = ReturnCyclesFixture.returnCycles()[1]
      returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
      returnRequirement.returnVersion.endDate = new Date('2025-05-01')
    })

    it('will persist the valid return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(returnRequirement, returnCycle, new Date('2025-05-01'))

      const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

      expect(results[0]).to.equal(`${returnLogPrefix}:2025-04-01:2025-05-01`)
    })
  })

  describe('when called with a quarterly return version with a start date that starts during the return cycle', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

      returnCycle = ReturnCyclesFixture.returnCycles()[1]
      returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
      returnRequirement.returnVersion.startDate = new Date('2025-07-27')
    })

    it('will persist the valid return logs generated from the return requirement and cycle passed in', async () => {
      const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

      const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

      expect(results).to.equal([
        `${returnLogPrefix}:2025-07-27:2025-09-30`,
        `${returnLogPrefix}:2025-10-01:2025-12-31`,
        `${returnLogPrefix}:2026-01-01:2026-03-31`
      ])
    })
  })

  describe('when called with a quarterly return version and a return cycle before 01-04-2025', () => {
    beforeEach(() => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

      returnCycle = ReturnCyclesFixture.returnCycles(6)[5]
      returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)
    })

    it('returns only one return log', async () => {
      const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

      const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

      expect(results).to.equal([`${returnLogPrefix}:2023-04-01:2024-03-31`])
    })
  })

  describe('when called when an existing return log already exists and a return cycle before 01-04-2025', () => {
    beforeEach(async () => {
      // NOTE: GenerateReturnLogService's results will depend on what the current date is, hence we control it
      clock = Sinon.useFakeTimers(new Date(`${year - 1}-12-01`))

      returnCycle = ReturnCyclesFixture.returnCycles(6)[5]
      returnRequirement = ReturnRequirementsFixture.winterReturnRequirement(true)

      const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

      await ReturnLogHelper.add({
        id: `${returnLogPrefix}:2023-04-01:2024-03-31`,
        licenceRef: returnRequirement.returnVersion.licence.licenceRef,
        endDate: new Date('2024-03-31'),
        returnReference: returnRequirement.reference,
        startDate: new Date('2023-04-01')
      })
    })

    it('returns one return log for the year', async () => {
      const results = await CreateReturnLogsService.go(returnRequirement, returnCycle)

      const returnLogPrefix = ReturnRequirementsFixture.returnLogPrefix(returnRequirement)

      expect(results).to.equal([`${returnLogPrefix}:2023-04-01:2024-03-31`])
    })
  })
})
