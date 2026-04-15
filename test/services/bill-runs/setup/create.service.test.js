'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../app/dal/delete-session.dal.js')
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

    Sinon.stub(DeleteSessionDal, 'go').resolves()
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
      await CreateService.go(session, blockingResults, user)

      expect(
        startBillRunProcessServiceStub.calledWith(regionId, 'supplementary', 'carol.shaw@atari.com', 2025)
      ).to.be.true()
      expect(legacyCreateBillRunRequestStub.calledWith('supplementary', regionId, 2025, user, false)).to.be.true()
    })

    it('deletes the setup session', async () => {
      await CreateService.go(session, blockingResults, user)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })
  })

  describe('when the "blockingResults" determines only the "current" bill run should be triggered', () => {
    beforeEach(() => {
      sessionData = { region: regionId, type: 'annual' }

      session = SessionModelStub.build(Sinon, sessionData)

      blockingResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.current }
    })

    it('triggers only the "current" bill run engine', async () => {
      await CreateService.go(session, blockingResults, user)

      expect(startBillRunProcessServiceStub.calledWith(regionId, 'annual', 'carol.shaw@atari.com', 2025)).to.be.true()
      expect(legacyCreateBillRunRequestStub.called).to.be.false()
    })

    it('deletes the setup session', async () => {
      await CreateService.go(session, blockingResults, user)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })
  })

  describe('when the "blockingResults" determines only the "old" bill run should be triggered', () => {
    beforeEach(() => {
      sessionData = { region: regionId, type: 'two_part_tariff', season: 'summer' }

      session = SessionModelStub.build(Sinon, sessionData)

      blockingResults = { matches: [], toFinancialYearEnding: 2022, trigger: engineTriggers.old }
    })

    it('triggers only the "old" bill run engine', async () => {
      await CreateService.go(session, blockingResults, user)

      expect(startBillRunProcessServiceStub.called).to.be.false()
      expect(legacyCreateBillRunRequestStub.calledWith('two_part_tariff', regionId, 2022, user, true)).to.be.true()
    })

    it('deletes the setup session', async () => {
      await CreateService.go(session, blockingResults, user)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })
  })
})
