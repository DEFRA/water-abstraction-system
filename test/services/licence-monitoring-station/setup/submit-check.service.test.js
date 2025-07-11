'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceMonitoringStationModel = require('../../../../app/models/licence-monitoring-station.model.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/licence-monitoring-station/setup/submit-check.service.js')

describe('Licence Monitoring Station Setup - Submit Check Service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
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

    session = await SessionHelper.add({ data: sessionData })

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    it('creates the monitoring station tag', async () => {
      await SubmitCheckService.go(session.id, yarStub)

      const result = await LicenceMonitoringStationModel.query()
        .where('monitoringStationId', sessionData.monitoringStationId)
        .first()

      expect(result.monitoringStationId).to.exist()
    })

    it('deletes the session', async () => {
      await SubmitCheckService.go(session.id, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.not.exist()
    })

    it('continues the journey', async () => {
      const result = await SubmitCheckService.go(session.id, yarStub)

      expect(result).to.equal(sessionData.monitoringStationId)
    })

    it('sets the notification message title to "Success" and the text to "Tag for licence ... added" ', async () => {
      await SubmitCheckService.go(session.id, yarStub)

      const [flashType, notification] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(notification).to.equal({ title: 'Success', text: `Tag for licence ${session.data.licenceRef} added` })
    })

    describe('and the session unit is a flow unit', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ data: { ...sessionData, unit: 'm3/s' } })
      })

      it('sets "measureType" as "flow"', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.measureType).to.equal('flow')
      })
    })

    describe('and the session unit is a level unit', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ data: { ...sessionData, unit: 'mAOD' } })
      })

      it('sets "measureType" as "level"', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.measureType).to.equal('level')
      })
    })

    describe('and "stopOrReduce" is "stop"', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({ data: { ...sessionData, stopOrReduce: 'stop' } })
      })

      it('sets "restrictionType" as "stop"', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.restrictionType).to.equal('stop')
      })
    })

    describe('and "stopOrReduce" is "reduce"', () => {
      describe('and "reduceAtThreshold" is "no"', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: { ...sessionData, stopOrReduce: 'reduce', reduceAtThreshold: 'no' }
          })
        })

        it('sets "restrictionType" as "reduce"', async () => {
          await SubmitCheckService.go(session.id, yarStub)

          const result = await LicenceMonitoringStationModel.query()
            .where('monitoringStationId', sessionData.monitoringStationId)
            .first()

          expect(result.restrictionType).to.equal('reduce')
        })
      })

      describe('and "reduceAtThreshold" is "yes"', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: { ...sessionData, stopOrReduce: 'reduce', reduceAtThreshold: 'yes' }
          })
        })

        it('sets "restrictionType" as "stop_or_reduce"', async () => {
          await SubmitCheckService.go(session.id, yarStub)

          const result = await LicenceMonitoringStationModel.query()
            .where('monitoringStationId', sessionData.monitoringStationId)
            .first()

          expect(result.restrictionType).to.equal('stop_or_reduce')
        })
      })
    })

    describe('and "conditionId" is a condition UUID', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            ...sessionData,
            conditionId: generateUUID()
          }
        })
      })

      it('persists the licence version purpose condition id', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.licenceVersionPurposeConditionId).to.equal(session.data.conditionId)
      })

      it('does not persist abstraction period', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.abstractionPeriodStartDay).to.not.exist()
        expect(result.abstractionPeriodStartMonth).to.not.exist()
        expect(result.abstractionPeriodEndDay).to.not.exist()
        expect(result.abstractionPeriodEndMonth).to.not.exist()
      })
    })

    describe('and "conditionId" is "no_condition"', () => {
      it('persists the abstraction period', async () => {
        await SubmitCheckService.go(session.id, yarStub)

        const result = await LicenceMonitoringStationModel.query()
          .where('monitoringStationId', sessionData.monitoringStationId)
          .first()

        expect(result.abstractionPeriodStartDay).to.equal(sessionData.abstractionPeriodStartDay)
        expect(result.abstractionPeriodStartMonth).to.equal(sessionData.abstractionPeriodStartMonth)
        expect(result.abstractionPeriodEndDay).to.equal(sessionData.abstractionPeriodEndDay)
        expect(result.abstractionPeriodEndMonth).to.equal(sessionData.abstractionPeriodEndMonth)
      })
    })
  })
})
