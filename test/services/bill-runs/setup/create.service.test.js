'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Things we need to stub
const LegacyCreateBillRunRequest = require('../../../../app/requests/legacy/create-bill-run.request.js')
const StartBillRunProcessService = require('../../../../app/services/bill-runs/start-bill-run-process.service.js')

// Thing under test
const CreateService = require('../../../../app/services/bill-runs/setup/create.service.js')

describe('Bill Runs Setup Create service', () => {
  const user = { username: 'carol.shaw@atari.com' }

  let existsResults
  let legacyCreateBillRunRequestStub
  let region
  let session
  let startBillRunProcessServiceStub

  beforeEach(async () => {
    region = RegionHelper.data[0]

    legacyCreateBillRunRequestStub = Sinon.stub(LegacyCreateBillRunRequest, 'send')
    startBillRunProcessServiceStub = Sinon.stub(StartBillRunProcessService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called and the bill runs have been triggered', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { region: region.id, type: 'annual' }
      })
      // NOTE: We make these additional $afterFind() calls to trigger the hook that would have been called when the
      // create service queries for the session. The hook elevates properties from `data` onto the session instance
      // itself. Without this the tests fail though the service works fine.
      session.$afterFind()

      existsResults = { matchResults: [], session, yearToUse: 2024 }
    })

    it('deletes the setup session', async () => {
      await CreateService.go(user, existsResults)

      const findSessionResults = await SessionModel.query().where('id', session.id)

      expect(findSessionResults).to.be.empty()
    })
  })

  describe('when the user wishes to create an annual bill run', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { region: region.id, type: 'annual' }
      })
      session.$afterFind()

      existsResults = { matchResults: [], session, yearToUse: 2024 }
    })

    it('only triggers our bill run process', async () => {
      await CreateService.go(user, existsResults)

      expect(legacyCreateBillRunRequestStub.called).to.be.false()
      expect(startBillRunProcessServiceStub.calledWith(
        region.id,
        'annual',
        'carol.shaw@atari.com',
        2024)
      ).to.be.true()
    })
  })

  describe('when the user wishes to create a supplementary bill run', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { region: region.id, type: 'supplementary' }
      })
      session.$afterFind()
    })

    describe('and there were no matching bill runs', () => {
      beforeEach(async () => {
        existsResults = { matchResults: [], session, yearToUse: 2024 }
      })

      it('triggers both our and the legacy bill run processes', async () => {
        await CreateService.go(user, existsResults)

        expect(legacyCreateBillRunRequestStub.called).to.be.true()
        expect(startBillRunProcessServiceStub.calledWith(
          region.id,
          'supplementary',
          'carol.shaw@atari.com',
          2024)
        ).to.be.true()
      })
    })

    describe('and there is a matching PRESROC bill run', () => {
      beforeEach(async () => {
        existsResults = { matchResults: [{ scheme: 'alcs' }], session, yearToUse: 2024 }
      })

      it('only triggers our bill run process', async () => {
        await CreateService.go(user, existsResults)

        expect(legacyCreateBillRunRequestStub.called).to.be.false()
        expect(startBillRunProcessServiceStub.calledWith(
          region.id,
          'supplementary',
          'carol.shaw@atari.com',
          2024)
        ).to.be.true()
      })
    })

    describe('and there is a matching SROC bill run', () => {
      beforeEach(async () => {
        existsResults = { matchResults: [{ scheme: 'sroc' }], session, yearToUse: 2024 }
      })

      it('only triggers the legacy bill run process', async () => {
        await CreateService.go(user, existsResults)

        expect(legacyCreateBillRunRequestStub.called).to.be.true()
        expect(startBillRunProcessServiceStub.called).to.be.false()
      })
    })
  })

  describe('when the user wishes to create a two-part tariff bill run', () => {
    describe('in a PRESROC year', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            region: region.id,
            type: 'two_part_tariff',
            year: 2022,
            season: 'summer'
          }
        })
        session.$afterFind()

        existsResults = { matchResults: [], session, yearToUse: 2022 }
      })

      it('only triggers the legacy bill run process', async () => {
        await CreateService.go(user, existsResults)

        expect(legacyCreateBillRunRequestStub.called).to.be.true()
        expect(startBillRunProcessServiceStub.called).to.be.false()
      })
    })

    describe('in an SROC year', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            region: region.id,
            type: 'two_part_tariff',
            year: 2023
          }
        })
        session.$afterFind()

        existsResults = { matchResults: [], session, yearToUse: 2023 }
      })

      it('only triggers our bill run process', async () => {
        await CreateService.go(user, existsResults)

        expect(legacyCreateBillRunRequestStub.called).to.be.false()
        expect(startBillRunProcessServiceStub.calledWith(
          region.id,
          'two_part_tariff',
          'carol.shaw@atari.com',
          2023)
        ).to.be.true()
      })
    })
  })
})
