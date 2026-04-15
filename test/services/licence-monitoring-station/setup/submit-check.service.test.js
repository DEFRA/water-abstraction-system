'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceMonitoringStationModel = require('../../../../app/models/licence-monitoring-station.model.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
const DeleteSessionDal = require('../../../../app/dal/delete-session.dal.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/licence-monitoring-station/setup/submit-check.service.js')

describe('Licence Monitoring Station Setup - Submit Check Service', () => {
  const userId = 12345

  let fetchSessionStub
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      unit: 'Ml/d',
      label: 'LABEL',
      licenceId: generateUUID(),
      threshold: 100,
      licenceRef: 'LICENCE_REF',
      conditionId: 'no_condition',
      stopOrReduce: 'stop',
      checkPageVisited: true,
      reduceAtThreshold: null,
      monitoringStationId: generateUUID(),
      conditionDisplayText: 'CONDITION_DISPLAY_TEXT',
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    Sinon.stub(DeleteSessionDal, 'go').resolves()

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('creates the monitoring station tag', async () => {
      await SubmitCheckService.go(session.id, userId, yarStub)

      const result = await LicenceMonitoringStationModel.query()
        .where('monitoringStationId', sessionData.monitoringStationId)
        .first()

      expect(result.monitoringStationId).to.exist()
    })

    it('persists the abstraction period', async () => {
      await SubmitCheckService.go(session.id, userId, yarStub)

      const result = await LicenceMonitoringStationModel.query()
        .where('monitoringStationId', sessionData.monitoringStationId)
        .first()

      expect(result.abstractionPeriodStartDay).to.equal(sessionData.abstractionPeriodStartDay)
      expect(result.abstractionPeriodStartMonth).to.equal(sessionData.abstractionPeriodStartMonth)
      expect(result.abstractionPeriodEndDay).to.equal(sessionData.abstractionPeriodEndDay)
      expect(result.abstractionPeriodEndMonth).to.equal(sessionData.abstractionPeriodEndMonth)
    })

    it('persists the user that created the tag', async () => {
      await SubmitCheckService.go(session.id, userId, yarStub)

      const result = await LicenceMonitoringStationModel.query()
        .where('monitoringStationId', sessionData.monitoringStationId)
        .first()

      expect(result.createdBy).to.equal(userId)
    })

    it('deletes the session', async () => {
      await SubmitCheckService.go(session.id, userId, yarStub)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitCheckService.go(session.id, userId, yarStub)

      expect(result).to.equal(sessionData.monitoringStationId)
    })

    it('sets the notification message title to "Success" and the text to "Tag for licence ... added" ', async () => {
      await SubmitCheckService.go(session.id, userId, yarStub)

      const [flashType, notification] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notification).to.equal({
        titleText: 'Success',
        text: `Tag for licence ${session.licenceRef} added`
      })
    })

    describe('and the session unit is a flow unit', () => {
      beforeEach(() => {
        sessionData = { ...sessionData, unit: 'm3/s' }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('sets "measureType" as "flow"', async () => {
        await SubmitCheckService.go(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.measureType).to.equal('flow')
      })
    })

    describe('and the session unit is a level unit', () => {
      beforeEach(() => {
        sessionData = { ...sessionData, unit: 'mAOD' }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('sets "measureType" as "level"', async () => {
        await SubmitCheckService.go(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.measureType).to.equal('level')
      })
    })

    describe('and "stopOrReduce" is "stop"', () => {
      beforeEach(() => {
        sessionData = { ...sessionData, stopOrReduce: 'stop' }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('sets "restrictionType" as "stop"', async () => {
        await SubmitCheckService.go(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.restrictionType).to.equal('stop')
      })
    })

    describe('and "stopOrReduce" is "reduce"', () => {
      describe('and "reduceAtThreshold" is "no"', () => {
        beforeEach(() => {
          sessionData = { ...sessionData, stopOrReduce: 'reduce', reduceAtThreshold: 'no' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('sets "restrictionType" as "reduce"', async () => {
          await SubmitCheckService.go(session.id, userId, yarStub)

          const result = await LicenceMonitoringStationModel.query()
            .where('monitoringStationId', sessionData.monitoringStationId)
            .first()

          expect(result.restrictionType).to.equal('reduce')
        })
      })

      describe('and "reduceAtThreshold" is "yes"', () => {
        beforeEach(() => {
          sessionData = { ...sessionData, stopOrReduce: 'reduce', reduceAtThreshold: 'yes' }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('sets "restrictionType" as "stop_or_reduce"', async () => {
          await SubmitCheckService.go(session.id, userId, yarStub)

          const result = await LicenceMonitoringStationModel.query()
            .where('monitoringStationId', sessionData.monitoringStationId)
            .first()

          expect(result.restrictionType).to.equal('stop_or_reduce')
        })
      })
    })

    describe('and "conditionId" is a condition UUID', () => {
      beforeEach(() => {
        sessionData = { ...sessionData, conditionId: generateUUID() }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('persists the licence version purpose condition id', async () => {
        await SubmitCheckService.go(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.licenceVersionPurposeConditionId).to.equal(sessionData.conditionId)
      })
    })

    describe('and "conditionId" is "no_condition"', () => {
      it('sets the licence version purpose condition id to NULL', async () => {
        await SubmitCheckService.go(session.id, userId, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.licenceVersionPurposeConditionId).to.be.null()
      })
    })
  })
})
