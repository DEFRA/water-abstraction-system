'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { returnCycle, returnRequirement } = require('../../fixtures/return-logs.fixture.js')

// Things we need to stub
const GenerateReturnLogService = require('../../../app/services/return-logs/generate-return-log.service.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')

// Thing under test
const CreateReturnLogsService = require('../../../app/services/return-logs/create-return-logs.service.js')

describe('Return Logs - Create Return Logs service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let clock
  let insertStub
  let notifierStub
  let testReturnCycle
  let testReturnRequirement

  beforeEach(() => {
    insertStub = Sinon.stub().returnsThis()
    Sinon.stub(ReturnLogModel, 'query').returns({
      insert: insertStub,
      onConflict: Sinon.stub().returnsThis(),
      ignore: Sinon.stub().resolves()
    })

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

      testReturnCycle = returnCycle()
      testReturnRequirement = returnRequirement()
    })

    it('will persist the return logs generated from the return requirement and cycle passed in', async () => {
      await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

      expect(insertStub.callCount).to.equal(1)

      // Check we create the return log as expected
      const [insertObject] = insertStub.args[0]

      // NOTE: We don't assert every property of the object passed in because we know it is coming from
      // GenerateReturnLogService and that has its own suite of tests. We do however confirm that the createdAt and
      // UpdatedAt properties are set because those only get set in the service
      expect(insertObject.id).to.equal('v1:4:01/25/90/3242:16999651:2024-04-01:2025-03-31')
      expect(insertObject.createdAt).to.exist()
      expect(insertObject.updatedAt).to.exist()
    })

    it('returns the return log IDs it generated', async () => {
      const results = await CreateReturnLogsService.go(testReturnRequirement, testReturnCycle)

      expect(results).to.equal(['v1:4:01/25/90/3242:16999651:2024-04-01:2025-03-31'])
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
        expect(args[1].returnCycle.id).to.equal('6889b98d-964f-4966-b6d6-bf511d6526a1')
        expect(args[2]).to.be.an.error()
      })
    })
  })
})
