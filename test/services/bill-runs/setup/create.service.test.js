'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')
const { engineTriggers } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const LegacyCreateBillRunRequest = require('../../../../app/requests/legacy/create-bill-run.request.js')
const StartBillRunProcessService = require('../../../../app/services/bill-runs/start-bill-run-process.service.js')

// Thing under test
const CreateService = require('../../../../app/services/bill-runs/setup/create.service.js')

describe('Bill Runs Setup Create service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'
  const user = { username: 'carol.shaw@atari.com' }

  let existsResults
  let legacyCreateBillRunRequestStub
  let session
  let startBillRunProcessServiceStub

  beforeEach(async () => {
    legacyCreateBillRunRequestStub = Sinon.stub(LegacyCreateBillRunRequest, 'send')
    startBillRunProcessServiceStub = Sinon.stub(StartBillRunProcessService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the "existsResults" determines both bill runs should be triggered', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { region: regionId, type: 'supplementary' }
      })
      // NOTE: We make these additional $afterFind() calls to trigger the hook that would have been called when the
      // create service queries for the session. The hook elevates properties from `data` onto the session instance
      // itself. Without this the tests fail though the service works fine.
      session.$afterFind()

      existsResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.both }
    })

    it('triggers both bill run engines', async () => {
      await CreateService.go(session, existsResults, user)

      expect(
        startBillRunProcessServiceStub.calledWith(regionId, 'supplementary', 'carol.shaw@atari.com', 2025)
      ).to.be.true()
      expect(legacyCreateBillRunRequestStub.calledWith('supplementary', regionId, 2025, user, undefined)).to.be.true()
    })

    it('deletes the setup session', async () => {
      await CreateService.go(session, existsResults, user)

      const findSessionResults = await SessionModel.query().where('id', session.id)

      expect(findSessionResults).to.be.empty()
    })
  })

  describe('when the "existsResults" determines only the "current" bill run should be triggered', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { region: regionId, type: 'annual' }
      })
      // NOTE: We make these additional $afterFind() calls to trigger the hook that would have been called when the
      // create service queries for the session. The hook elevates properties from `data` onto the session instance
      // itself. Without this the tests fail though the service works fine.
      session.$afterFind()

      existsResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.current }
    })

    it('triggers only the "current" bill run engine', async () => {
      await CreateService.go(session, existsResults, user)

      expect(startBillRunProcessServiceStub.calledWith(regionId, 'annual', 'carol.shaw@atari.com', 2025)).to.be.true()
      expect(legacyCreateBillRunRequestStub.called).to.be.false()
    })

    it('deletes the setup session', async () => {
      await CreateService.go(session, existsResults, user)

      const findSessionResults = await SessionModel.query().where('id', session.id)

      expect(findSessionResults).to.be.empty()
    })
  })

  describe('when the "existsResults" determines only the "old" bill run should be triggered', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { region: regionId, type: 'two_part_tariff', summer: true }
      })
      // NOTE: We make these additional $afterFind() calls to trigger the hook that would have been called when the
      // create service queries for the session. The hook elevates properties from `data` onto the session instance
      // itself. Without this the tests fail though the service works fine.
      session.$afterFind()

      existsResults = { matches: [], toFinancialYearEnding: 2022, trigger: engineTriggers.old }
    })

    it('triggers only the "old" bill run engine', async () => {
      await CreateService.go(session, existsResults, user)

      expect(startBillRunProcessServiceStub.called).to.be.false()
      expect(legacyCreateBillRunRequestStub.calledWith('two_part_tariff', regionId, 2022, user, true)).to.be.true()
    })

    it('deletes the setup session', async () => {
      await CreateService.go(session, existsResults, user)

      const findSessionResults = await SessionModel.query().where('id', session.id)

      expect(findSessionResults).to.be.empty()
    })
  })
})
