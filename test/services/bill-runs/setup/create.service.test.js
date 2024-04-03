'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
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
  let session
  let startBillRunProcessServiceStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    legacyCreateBillRunRequestStub = Sinon.stub(LegacyCreateBillRunRequest, 'send')
    startBillRunProcessServiceStub = Sinon.stub(StartBillRunProcessService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called and the bill runs have been triggered', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { region: '19a027c6-4aad-47d3-80e3-3917a4579a5b', type: 'annual' }
      })

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
        data: { region: '19a027c6-4aad-47d3-80e3-3917a4579a5b', type: 'annual' }
      })

      existsResults = { matchResults: [], session, yearToUse: 2024 }
    })

    it('only triggers our bill run process', async () => {
      await CreateService.go(user, existsResults)

      expect(legacyCreateBillRunRequestStub.called).to.be.false()
      expect(startBillRunProcessServiceStub.calledWith(
        '19a027c6-4aad-47d3-80e3-3917a4579a5b',
        'annual',
        'carol.shaw@atari.com',
        2024)
      ).to.be.true()
    })
  })

  describe('when the user wishes to create a supplementary bill run', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: { region: '19a027c6-4aad-47d3-80e3-3917a4579a5b', type: 'supplementary' }
      })
    })

    describe('and there were no matching bill runs', () => {
      beforeEach(async () => {
        existsResults = { matchResults: [], session, yearToUse: 2024 }
      })

      it('triggers both our and the legacy bill run processes', async () => {
        await CreateService.go(user, existsResults)

        expect(legacyCreateBillRunRequestStub.called).to.be.true()
        expect(startBillRunProcessServiceStub.calledWith(
          '19a027c6-4aad-47d3-80e3-3917a4579a5b',
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
          '19a027c6-4aad-47d3-80e3-3917a4579a5b',
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
            region: '19a027c6-4aad-47d3-80e3-3917a4579a5b',
            type: 'two_part_tariff',
            year: 2022,
            season: 'summer'
          }
        })

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
            region: '19a027c6-4aad-47d3-80e3-3917a4579a5b',
            type: 'two_part_tariff',
            year: 2023
          }
        })

        existsResults = { matchResults: [], session, yearToUse: 2023 }
      })

      it('only triggers our bill run process', async () => {
        await CreateService.go(user, existsResults)

        expect(legacyCreateBillRunRequestStub.called).to.be.false()
        expect(startBillRunProcessServiceStub.calledWith(
          '19a027c6-4aad-47d3-80e3-3917a4579a5b',
          'two_part_tariff',
          'carol.shaw@atari.com',
          2023)
        ).to.be.true()
      })
    })
  })
})
