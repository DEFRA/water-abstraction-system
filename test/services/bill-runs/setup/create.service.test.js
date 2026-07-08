'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const LegacyCreateBillRunRequest = require('../../../../app/requests/legacy/create-bill-run.request.js')
const StartBillRunProcessService = require('../../../../app/services/bill-runs/start-bill-run-process.service.js')

// Thing under test
const CreateService = require('../../../../app/services/bill-runs/setup/create.service.js')

describe('Bill Runs - Setup - Create service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'
  const user = { username: 'carol.shaw@atari.com' }

  let blockingResults
  let legacyCreateBillRunRequestStub
  let session
  let sessionData
  let startBillRunProcessServiceStub

  beforeEach(() => {
    legacyCreateBillRunRequestStub = Sinon.stub(LegacyCreateBillRunRequest, 'send')
    startBillRunProcessServiceStub = Sinon.stub(StartBillRunProcessService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the "blockingResults" determines both bill runs should be triggered', () => {
    beforeEach(() => {
      sessionData = { region: regionId, type: 'supplementary' }

      session = SessionModelStub.build(Sinon, sessionData)

      blockingResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.both }
    })

    it('triggers both bill run engines', async () => {
      await CreateService(session, blockingResults, user)

      expect(startBillRunProcessServiceStub.calledWith(regionId, 'supplementary', 'carol.shaw@atari.com', 2025)).toBe(
        true
      )
      expect(legacyCreateBillRunRequestStub.calledWith('supplementary', regionId, 2025, user, false)).toBe(true)
    })
  })

  describe('when the "blockingResults" determines only the "current" bill run should be triggered', () => {
    beforeEach(() => {
      sessionData = { region: regionId, type: 'annual' }

      session = SessionModelStub.build(Sinon, sessionData)

      blockingResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.current }
    })

    it('triggers only the "current" bill run engine', async () => {
      await CreateService(session, blockingResults, user)

      expect(startBillRunProcessServiceStub.calledWith(regionId, 'annual', 'carol.shaw@atari.com', 2025)).toBe(true)
      expect(legacyCreateBillRunRequestStub.called).toBe(false)
    })
  })

  describe('when the "blockingResults" determines only the "old" bill run should be triggered', () => {
    beforeEach(() => {
      sessionData = { region: regionId, type: 'two_part_tariff', season: 'summer' }

      session = SessionModelStub.build(Sinon, sessionData)

      blockingResults = { matches: [], toFinancialYearEnding: 2022, trigger: engineTriggers.old }
    })

    it('triggers only the "old" bill run engine', async () => {
      await CreateService(session, blockingResults, user)

      expect(startBillRunProcessServiceStub.called).toBe(false)
      expect(legacyCreateBillRunRequestStub.calledWith('two_part_tariff', regionId, 2022, user, true)).toBe(true)
    })
  })
})
